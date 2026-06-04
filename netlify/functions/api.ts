import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import * as crypto from 'crypto';

type IdentifierKind = 'name' | 'email' | 'mobile';
type LoginStatus = 'created' | 'matched' | 'password_mismatch';

interface LoginUser {
  id: string;
  identifier: string;
  normalizedIdentifier: string;
  identifierKind: IdentifierKind;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

const GOOGLE_PHOTOS_URL = getEnv('GOOGLE_PHOTOS_URL') || 'https://photos.app.goo.gl/tzRAJ8o9uzezd64g8';
const GOOGLE_PHOTOS_URL_2 = getEnv('GOOGLE_PHOTOS_URL_2') || 'https://photos.app.goo.gl/B3Y6wpJCWPKFuPXo6';
const GOOGLE_PHOTOS_LINKS = [
  {
    id: 'album-main',
    label: 'Memory Album',
    description: 'Our saved photos',
    url: GOOGLE_PHOTOS_URL
  },
  {
    id: 'album-extra',
    label: 'More Memories',
    description: 'Another shared album',
    url: GOOGLE_PHOTOS_URL_2
  }
].filter((album) => album.url);

const store = getStore({ name: 'apology-site-data', consistency: 'strong' });

function getEnv(key: string) {
  const netlifyGlobal = globalThis as typeof globalThis & {
    Netlify?: { env?: { get: (name: string) => string | undefined } };
  };

  return netlifyGlobal.Netlify?.env?.get(key) || process.env[key] || '';
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function readBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function readArray<T>(key: string): Promise<T[]> {
  const data = await store.get(key, { type: 'json' });
  return Array.isArray(data) ? data as T[] : [];
}

async function writeArray<T>(key: string, data: T[]) {
  await store.setJSON(key, data);
}

function getAdminPasscode() {
  return getEnv('ADMIN_PASSCODE') || 'change-this-admin-passcode';
}

function normalizeMobile(value: string) {
  return value.replace(/\D/g, '');
}

function getIdentifierKind(value: string): IdentifierKind {
  const trimmed = value.trim();
  const mobile = normalizeMobile(trimmed);

  if (trimmed.includes('@')) {
    return 'email';
  }

  if (/^[+\d\s\-()]+$/.test(trimmed) && mobile.length >= 7) {
    return 'mobile';
  }

  return 'name';
}

function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  const kind = getIdentifierKind(trimmed);

  if (kind === 'mobile') {
    return `mobile:${normalizeMobile(trimmed)}`;
  }

  if (kind === 'email') {
    return `email:${trimmed.toLowerCase()}`;
  }

  return `name:${trimmed.toLowerCase().replace(/\s+/g, ' ')}`;
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function createPasswordRecord(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    salt,
    passwordHash: hashPassword(password, salt)
  };
}

function verifyPassword(password: string, user: LoginUser) {
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex');

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

function toPublicLoginUser(user: LoginUser) {
  return {
    id: user.id,
    identifier: user.identifier,
    identifierKind: user.identifierKind,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    loginCount: user.loginCount
  };
}

function maskSecret(secret: string) {
  return secret ? `Password hidden (${secret.length} chars)` : 'Empty Password';
}

function isAuthorized(req: Request) {
  return req.headers.get('x-admin-passcode') === getAdminPasscode();
}

async function handleLogin(req: Request, context: Context) {
  const { name, identifier, secretCode } = await readBody(req);
  const loginIdentifier = String(identifier || name || '').trim();
  const loginPassword = String(secretCode || '').trim();
  const normalizedIdentifier = normalizeIdentifier(loginIdentifier);
  const now = new Date().toISOString();

  if (!loginIdentifier || !loginPassword) {
    return json({ success: false, error: 'Enter a name, Gmail, or mobile and a password.' }, 400);
  }

  if (loginPassword.length < 4) {
    return json({ success: false, error: 'Password must be at least 4 characters.' }, 400);
  }

  const users = await readArray<LoginUser>('login-users');
  const existingUser = users.find((user) => user.normalizedIdentifier === normalizedIdentifier);
  let success = false;
  let status: LoginStatus = 'password_mismatch';
  let responseMessage = '';

  if (!existingUser) {
    const passwordRecord = createPasswordRecord(loginPassword);
    users.unshift({
      id: Math.random().toString(36).substring(2, 9),
      identifier: loginIdentifier,
      normalizedIdentifier,
      identifierKind: getIdentifierKind(loginIdentifier),
      passwordHash: passwordRecord.passwordHash,
      salt: passwordRecord.salt,
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1
    });
    await writeArray('login-users', users);
    success = true;
    status = 'created';
    responseMessage = 'Account created and access granted.';
  } else if (verifyPassword(loginPassword, existingUser)) {
    existingUser.lastLoginAt = now;
    existingUser.loginCount += 1;
    await writeArray('login-users', users);
    success = true;
    status = 'matched';
    responseMessage = 'Access granted.';
  }

  const attempts = await readArray('login-attempts');
  attempts.unshift({
    id: Math.random().toString(36).substring(2, 9),
    name: loginIdentifier || 'Empty Identifier',
    code: maskSecret(loginPassword),
    success,
    status,
    timestamp: now,
    userAgent: req.headers.get('user-agent') || 'Unknown',
    ip: req.headers.get('x-forwarded-for') || context.ip || 'Unknown'
  });
  await writeArray('login-attempts', attempts);

  if (success) {
    return json({ success: true, status, message: responseMessage });
  }

  return json({
    success: false,
    status,
    error: 'This name, Gmail, or mobile already has a saved password. Use the first password created for this account.'
  }, 401);
}

async function handleForgive(req: Request, context: Context) {
  const { choice } = await readBody(req);

  if (!choice || (choice !== 'yes' && choice !== 'thinking')) {
    return json({ error: 'Invalid response choice.' }, 400);
  }

  const responses = await readArray('responses');
  const newResponse = {
    id: Math.random().toString(36).substring(2, 9),
    choice,
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent') || 'Unknown',
    ip: req.headers.get('x-forwarded-for') || context.ip || 'Unknown'
  };

  responses.unshift(newResponse);
  await writeArray('responses', responses);
  return json({ success: true, choice: newResponse.choice });
}

async function route(req: Request, context: Context) {
  const pathname = new URL(req.url).pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method === 'GET' && pathname === '/api/settings/public') {
    return json({ success: true, googlePhotosUrl: GOOGLE_PHOTOS_URL, googlePhotosLinks: GOOGLE_PHOTOS_LINKS });
  }

  if (req.method === 'POST' && pathname === '/api/forgive') {
    return handleForgive(req, context);
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    return handleLogin(req, context);
  }

  if (req.method === 'POST' && pathname === '/api/admin/auth') {
    const { passcode } = await readBody(req);
    return passcode === getAdminPasscode()
      ? json({ success: true })
      : json({ error: 'Incorrect passcode.' }, 401);
  }

  if (!pathname.startsWith('/api/admin/')) {
    return json({ error: 'Not found.' }, 404);
  }

  if (!isAuthorized(req)) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
    const [loginUsers, responses, loginAttempts] = await Promise.all([
      readArray<LoginUser>('login-users'),
      readArray('responses'),
      readArray('login-attempts')
    ]);

    return json({
      success: true,
      loginMode: 'first-login-registers',
      loginUsers: loginUsers.map(toPublicLoginUser),
      responses,
      loginAttempts
    });
  }

  if (req.method === 'POST' && pathname === '/api/admin/settings/login') {
    return json({
      success: false,
      error: 'Fixed login credentials are disabled. Visitor accounts are created on first login.'
    }, 410);
  }

  if (req.method === 'POST' && pathname === '/api/admin/login-users/clear') {
    await writeArray('login-users', []);
    return json({ success: true, loginUsers: [] });
  }

  if (req.method === 'POST' && pathname === '/api/admin/responses/clear') {
    await writeArray('responses', []);
    return json({ success: true, responses: [] });
  }

  if (req.method === 'POST' && pathname === '/api/admin/login-attempts/clear') {
    await writeArray('login-attempts', []);
    return json({ success: true, loginAttempts: [] });
  }

  return json({ error: 'Not found.' }, 404);
}

export default async (req: Request, context: Context) => {
  try {
    return await route(req, context);
  } catch (err) {
    console.error('Netlify API error:', err);
    return json({ error: 'Internal server error.' }, 500);
  }
};

export const config: Config = {
  path: '/api/*'
};
