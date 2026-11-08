import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import type { Context } from '../create-context';
import { verifyAdminSessionToken, validateAdminLogin } from '../../config/admin';

export interface Session {
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
    subscriptionActive: boolean;
  };
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAuthClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

export async function getSession(ctx: Context): Promise<Session | null> {
  const authHeader = ctx.req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  if (!token) {
    return null;
  }

  if (token.startsWith('admin.')) {
    const admin = verifyAdminSessionToken(token);
    if (!admin) return null;
    return {
      user: {
        id: 'admin',
        email: admin.email,
        isAdmin: true,
        subscriptionActive: true,
      },
    };
  }

  // Do not trust arbitrary bearer strings as user IDs. Supabase validates the access token.
  if (!supabaseAuthClient) return null;
  const { data, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !data.user) return null;

  const userId = data.user.id;
  const subscriptionActive = await checkSubscription(userId);

  return {
    user: {
      id: userId,
      email: data.user.email || '',
      isAdmin: false,
      subscriptionActive,
    },
  };
}

export async function checkSubscription(userId: string): Promise<boolean> {
  console.log('🔒 Checking subscription for user:', userId);
  
  const { checkSubscriptionActive } = await import('../../storage/subscriptions');
  return checkSubscriptionActive(userId);
}

export async function requireAuth(ctx: Context, requireAdmin = false) {
  const session = await getSession(ctx);
  
  if (!session) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: 'You must be logged in.' 
    });
  }

  if (!session.user.isAdmin) {
    const activeSub = await checkSubscription(session.user.id);
    if (!activeSub) {
      throw new TRPCError({ 
        code: 'FORBIDDEN', 
        message: 'You must have an active subscription to submit releases.' 
      });
    }
  }

  if (requireAdmin && !session.user.isAdmin) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Admin access required.' 
    });
  }

  return session;
}

export async function requireSubscriber(ctx: Context) {
  const session = await getSession(ctx);
  
  if (!session) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: 'You must be logged in.' 
    });
  }

  if (!session.user.isAdmin) {
    const activeSub = await checkSubscription(session.user.id);
    if (!activeSub) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You must have an active subscription to use this feature.'
      });
    }
  }
  
  return session.user;
}

export async function requireAdmin(ctx: Context, email: string, passcode: string) {
  const login = validateAdminLogin(email, passcode);
  if (!login.success || !login.user) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Admin access denied' 
    });
  }
  return login.user;
}
