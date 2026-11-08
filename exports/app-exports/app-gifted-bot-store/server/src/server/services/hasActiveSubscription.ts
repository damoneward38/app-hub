import { db } from "../db";
import { contentMasterPurchases } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function hasActiveSubscription(userId: number) {
  if (!db) return false;

  const sub = await db
    .select()
    .from(contentMasterPurchases)
    .where(eq(contentMasterPurchases.userId, userId))
    .limit(1);

  return sub.length > 0 && sub[0].status === "completed";
}
