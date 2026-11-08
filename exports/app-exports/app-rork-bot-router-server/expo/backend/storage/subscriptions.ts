import { getDB, withRetry } from "./db";
import { SubscriptionPlan, UserSubscription } from "../types/subscription";

const subscriptions: UserSubscription[] = [];
let useDatabase = false;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initDB() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    if (isInitialized) return;
    isInitialized = true;
    
    try {
      await getDB();
      useDatabase = true;
      console.log('✅ Subscriptions storage using SurrealDB');
    } catch (err) {
      console.warn('⚠️ Subscriptions storage falling back to in-memory:', err);
      useDatabase = false;
    }
  })();
  
  return initPromise;
}

initDB();

export async function getSubscription(userId: string): Promise<UserSubscription | null> {
  await initDB();
  if (!useDatabase) {
    return subscriptions.find(s => s.userId === userId) || null;
  }
  
  try {
    const db = await getDB();
    const result = await withRetry(() => db.select(`subscriptions:${userId}`));
    return result as unknown as UserSubscription | null;
  } catch (err) {
    console.error('❌ Failed to fetch subscription from DB:', err);
    return subscriptions.find(s => s.userId === userId) || null;
  }
}

export async function checkSubscriptionActive(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  
  const isActive = sub.status === 'active' && new Date(sub.expiresAt) > new Date();
  console.log(`📋 Subscription check for ${userId}:`, isActive ? 'ACTIVE' : 'INACTIVE');
  return isActive;
}

export async function createSubscription(
  userId: string, 
  plan: SubscriptionPlan,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  paypalEmail?: string,
  paypalBillingAgreementId?: string
): Promise<UserSubscription> {
  await initDB();
  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  
  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  const newSub: UserSubscription = {
    userId,
    plan,
    status: 'active',
    startedAt,
    expiresAt,
    stripeCustomerId,
    stripeSubscriptionId,
    paypalEmail,
    paypalBillingAgreementId,
  };

  if (!useDatabase) {
    const existing = subscriptions.find(s => s.userId === userId);
    
    if (existing) {
      existing.plan = plan;
      existing.status = 'active';
      existing.startedAt = startedAt;
      existing.expiresAt = expiresAt;
      existing.stripeCustomerId = stripeCustomerId;
      existing.stripeSubscriptionId = stripeSubscriptionId;
      existing.paypalEmail = paypalEmail;
      existing.paypalBillingAgreementId = paypalBillingAgreementId;
      console.log(`✅ Updated subscription for ${userId}:`, plan);
      return existing;
    }

    subscriptions.push(newSub);
    console.log(`✅ Created subscription for ${userId}:`, plan);
    return newSub;
  }
  
  try {
    const db = await getDB();
    await withRetry(() => db.create(`subscriptions:${userId}`, newSub as any));
    console.log(`✅ Created/updated subscription for ${userId}:`, plan);
    return newSub;
  } catch (err) {
    console.error('❌ Failed to save subscription to DB:', err);
    const existing = subscriptions.find(s => s.userId === userId);
    if (existing) {
      Object.assign(existing, newSub);
      return existing;
    }
    subscriptions.push(newSub);
    return newSub;
  }
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  await initDB();
  if (!useDatabase) {
    const sub = subscriptions.find(s => s.userId === userId);
    if (!sub) return false;
    
    sub.status = 'cancelled';
    console.log(`❌ Cancelled subscription for ${userId}`);
    return true;
  }
  
  try {
    const db = await getDB();
    const sub = await getSubscription(userId);
    if (!sub) return false;
    
    sub.status = 'cancelled';
    await withRetry(() => db.merge(`subscriptions:${userId}`, { status: 'cancelled' }));
    console.log(`❌ Cancelled subscription for ${userId}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to cancel subscription in DB:', err);
    const sub = subscriptions.find(s => s.userId === userId);
    if (!sub) return false;
    sub.status = 'cancelled';
    return true;
  }
}

export async function getAllSubscriptions(): Promise<UserSubscription[]> {
  await initDB();
  if (!useDatabase) return subscriptions;
  
  try {
    const db = await getDB();
    const result = await withRetry(() => db.select('subscriptions'));
    return result as unknown as UserSubscription[];
  } catch (err) {
    console.error('❌ Failed to fetch subscriptions from DB:', err);
    return subscriptions;
  }
}
