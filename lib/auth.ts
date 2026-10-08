import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.NEXTAUTH_SECRET || 'ops3-super-secret-key-change-in-production-32chars';
const SESSION_COOKIE = 'ops3_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number; // unix timestamp in ms
}

export function signSession(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 30): string {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const fullPayload: SessionPayload = { ...payload, exp };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;

    const parsed: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > parsed.exp) return null; // expired

    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>) {
  const token = signSession(payload, 30);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent session
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
