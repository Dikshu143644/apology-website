import express from 'express';
import path from 'path';
import fs from 'fs';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const RESPONSES_FILE = path.join(process.cwd(), 'responses.json');
const LOGIN_ATTEMPTS_FILE = path.join(process.cwd(), 'login-attempts.json');
const LOGIN_USERS_FILE = path.join(process.cwd(), 'login-users.json');
const GOOGLE_PHOTOS_URL = process.env.GOOGLE_PHOTOS_URL || 'https://photos.app.goo.gl/tzRAJ8o9uzezd64g8';
const GOOGLE_PHOTOS_URL_2 = process.env.GOOGLE_PHOTOS_URL_2 || 'https://photos.app.goo.gl/B3Y6wpJCWPKFuPXo6';
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

type IdentifierKind = 'name' | 'email' | 'mobile';

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

interface PublicLoginUser {
  id: string;
  identifier: string;
  identifierKind: IdentifierKind;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

// Load responses
function loadResponses(): any[] {
  try {
    if (fs.existsSync(RESPONSES_FILE)) {
      const data = fs.readFileSync(RESPONSES_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.error('Failed to read responses.json. Starting fresh.', e);
  }
  return [];
}

function saveResponses(data: any[]) {
  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write responses.json', e);
  }
}

// Load login attempts
function loadLoginAttempts(): any[] {
  try {
    if (fs.existsSync(LOGIN_ATTEMPTS_FILE)) {
      const data = fs.readFileSync(LOGIN_ATTEMPTS_FILE, 'utf-8');
      return sanitizeLoginAttempts(JSON.parse(data || '[]'));
    }
  } catch (e) {
    console.error('Failed to read login-attempts.json. Starting fresh.', e);
  }
  return [];
}

function saveLoginAttempts(data: any[]) {
  try {
    fs.writeFileSync(LOGIN_ATTEMPTS_FILE, JSON.stringify(sanitizeLoginAttempts(data), null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write login-attempts.json', e);
  }
}

function loadLoginUsers(): LoginUser[] {
  try {
    if (fs.existsSync(LOGIN_USERS_FILE)) {
      const data = fs.readFileSync(LOGIN_USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Failed to read login-users.json. Starting fresh.', e);
  }
  return [];
}

function saveLoginUsers(users: LoginUser[]) {
  try {
    fs.writeFileSync(LOGIN_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write login-users.json', e);
  }
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

function toPublicLoginUser(user: LoginUser): PublicLoginUser {
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
  if (!secret) {
    return 'Empty Password';
  }
  return `Password hidden (${secret.length} chars)`;
}

function sanitizeLoginAttempts(attempts: any[]) {
  return attempts.map((attempt) => ({
    ...attempt,
    code: attempt.code && String(attempt.code).startsWith('Password hidden')
      ? attempt.code
      : maskSecret(String(attempt.code || ''))
  }));
}

// Express JSON body parser
app.use(express.json());

// Helper to get admin passcode securely
const getAdminPasscode = (): string => {
  return process.env.ADMIN_PASSCODE || 'change-this-admin-passcode';
};

// API: Public non-sensitive site settings
app.get('/api/settings/public', (_req, res) => {
  res.json({
    success: true,
    googlePhotosUrl: GOOGLE_PHOTOS_URL,
    googlePhotosLinks: GOOGLE_PHOTOS_LINKS
  });
});

// API: Record a forgiveness choice response
app.post('/api/forgive', (req, res) => {
  try {
    const { choice } = req.body;
    if (!choice || (choice !== 'yes' && choice !== 'thinking')) {
      return res.status(400).json({ error: 'Invalid response choice.' });
    }

    const responses = loadResponses();
    const newResponse = {
      id: Math.random().toString(36).substring(2, 9),
      choice,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'Unknown'
    };

    responses.unshift(newResponse); // Keep latest on top
    saveResponses(responses);

    res.json({ success: true, choice: newResponse.choice });
  } catch (err) {
    console.error('API /api/forgive error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Login Endpoint for Normal Visitors
app.post('/api/login', (req, res) => {
  try {
    const { name, identifier, secretCode } = req.body;
    const loginIdentifier = String(identifier || name || '').trim();
    const loginPassword = String(secretCode || '').trim();
    const normalizedIdentifier = normalizeIdentifier(loginIdentifier);
    const now = new Date().toISOString();

    if (!loginIdentifier || !loginPassword) {
      return res.status(400).json({
        success: false,
        error: 'Enter a name, Gmail, or mobile and a password.'
      });
    }

    if (loginPassword.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters.'
      });
    }

    const users = loadLoginUsers();
    const existingUser = users.find((user) => user.normalizedIdentifier === normalizedIdentifier);
    let success = false;
    let status: 'created' | 'matched' | 'password_mismatch' = 'password_mismatch';
    let responseMessage = '';

    if (!existingUser) {
      const passwordRecord = createPasswordRecord(loginPassword);
      const newUser: LoginUser = {
        id: Math.random().toString(36).substring(2, 9),
        identifier: loginIdentifier,
        normalizedIdentifier,
        identifierKind: getIdentifierKind(loginIdentifier),
        passwordHash: passwordRecord.passwordHash,
        salt: passwordRecord.salt,
        createdAt: now,
        lastLoginAt: now,
        loginCount: 1
      };

      users.unshift(newUser);
      saveLoginUsers(users);
      success = true;
      status = 'created';
      responseMessage = 'Account created and access granted.';
    } else if (verifyPassword(loginPassword, existingUser)) {
      existingUser.lastLoginAt = now;
      existingUser.loginCount += 1;
      saveLoginUsers(users);
      success = true;
      status = 'matched';
      responseMessage = 'Access granted.';
    }

    // Log the attempt
    const attempts = loadLoginAttempts();
    const newAttempt = {
      id: Math.random().toString(36).substring(2, 9),
      name: loginIdentifier || 'Empty Identifier',
      code: maskSecret(loginPassword),
      success,
      status,
      timestamp: now,
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'Unknown'
    };
    attempts.unshift(newAttempt);
    saveLoginAttempts(attempts);

    if (success) {
      return res.json({ success: true, status, message: responseMessage });
    }

    return res.status(401).json({
      success: false,
      status,
      error: 'This name, Gmail, or mobile already has a saved password. Use the first password created for this account.'
    });
  } catch (err) {
    console.error('API /api/login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Check Admin Passcode
app.post('/api/admin/auth', (req, res) => {
  try {
    const { passcode } = req.body;
    const actualPasscode = getAdminPasscode();
    if (passcode === actualPasscode) {
      return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Incorrect passcode.' });
  } catch (err) {
    console.error('API /api/admin/auth error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Retrieve Dashboard Data (Protected accounts, responses, and login attempts)
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const passcode = req.headers['x-admin-passcode'] as string;
    const actualPasscode = getAdminPasscode();
    if (passcode !== actualPasscode) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const loginUsers = loadLoginUsers().map(toPublicLoginUser);
    const responses = loadResponses();
    const loginAttempts = loadLoginAttempts();

    res.json({
      success: true,
      loginMode: 'first-login-registers',
      loginUsers,
      responses,
      loginAttempts
    });
  } catch (err) {
    console.error('API /api/admin/dashboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Update Site Login Settings
app.post('/api/admin/settings/login', (req, res) => {
  try {
    const passcode = req.headers['x-admin-passcode'] as string;
    const actualPasscode = getAdminPasscode();
    if (passcode !== actualPasscode) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    return res.status(410).json({
      success: false,
      error: 'Fixed login credentials are disabled. Visitor accounts are created on first login.'
    });
  } catch (err) {
    console.error('API /api/admin/settings/login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Clear Registered Login Accounts
app.post('/api/admin/login-users/clear', (req, res) => {
  try {
    const passcode = req.headers['x-admin-passcode'] as string;
    const actualPasscode = getAdminPasscode();
    if (passcode !== actualPasscode) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    saveLoginUsers([]);
    res.json({ success: true, loginUsers: [] });
  } catch (err) {
    console.error('API /api/admin/login-users/clear error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Clear Responses
app.post('/api/admin/responses/clear', (req, res) => {
  try {
    const passcode = req.headers['x-admin-passcode'] as string;
    const actualPasscode = getAdminPasscode();
    if (passcode !== actualPasscode) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    saveResponses([]);
    res.json({ success: true, responses: [] });
  } catch (err) {
    console.error('API /api/admin/responses/clear error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// API: Clear Login Attempts
app.post('/api/admin/login-attempts/clear', (req, res) => {
  try {
    const passcode = req.headers['x-admin-passcode'] as string;
    const actualPasscode = getAdminPasscode();
    if (passcode !== actualPasscode) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    saveLoginAttempts([]);
    res.json({ success: true, loginAttempts: [] });
  } catch (err) {
    console.error('API /api/admin/login-attempts/clear error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Initialize server and bundler middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Serve index.html for SPA page loads
    app.get('*', (req, res, next) => {
      // Avoid intercepting API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
