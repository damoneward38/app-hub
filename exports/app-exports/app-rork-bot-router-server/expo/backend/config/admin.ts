import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';

export const ADMIN_ACCOUNT = {
  name: 'Admin',
  email: ADMIN_EMAIL,
  passcode: ADMIN_PASSWORD,
  isAdmin: true,
};

export function validateAdminLogin(email: string, passcode: string) {
  const expectedEmail = Buffer.from(ADMIN_ACCOUNT.email);
  const suppliedEmail = Buffer.from(email);
  const expectedPassword = Buffer.from(ADMIN_ACCOUNT.passcode);
  const suppliedPassword = Buffer.from(passcode);
  const emailMatches = expectedEmail.length > 0 && expectedEmail.length === suppliedEmail.length && timingSafeEqual(expectedEmail, suppliedEmail);
  const passwordMatches = expectedPassword.length > 0 && expectedPassword.length === suppliedPassword.length && timingSafeEqual(expectedPassword, suppliedPassword);
  if (ADMIN_ACCOUNT.email && ADMIN_ACCOUNT.passcode && emailMatches && passwordMatches) {
    return { success: true, user: { name: ADMIN_ACCOUNT.name, email: ADMIN_ACCOUNT.email, isAdmin: true as const } };
  }
  return { success: false, error: 'Invalid admin credentials' };
}

export function createAdminSessionToken(email: string, passcode: string) {
  const login = validateAdminLogin(email, passcode);
  if (!login.success || !login.user || ADMIN_SESSION_SECRET.length < 32) return null;
  const payload = Buffer.from(JSON.stringify({
    sub: 'admin',
    email: login.user.email,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  })).toString('base64url');
  const unsigned = 'admin.' + payload;
  const signature = createHmac('sha256', ADMIN_SESSION_SECRET).update(unsigned).digest('base64url');
  return unsigned + '.' + signature;
}

export function verifyAdminSessionToken(token: string) {
  if (ADMIN_SESSION_SECRET.length < 32) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return null;
  const unsigned = parts[0] + '.' + parts[1];
  const expected = Buffer.from(createHmac('sha256', ADMIN_SESSION_SECRET).update(unsigned).digest('base64url'));
  const supplied = Buffer.from(parts[2]);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { sub?: string; email?: string; exp?: number };
    if (payload.sub !== 'admin' || !payload.email || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: 'admin', email: payload.email };
  } catch {
    return null;
  }
}
