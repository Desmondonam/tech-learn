import jwt from 'jsonwebtoken';
import type { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'auth_token';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookieHeader = req.headers.cookie || '';
  const entry = cookieHeader.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  return entry.trim().slice(COOKIE_NAME.length + 1);
}

export function setCookieHeader(token: string): string {
  const maxAge = 7 * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
