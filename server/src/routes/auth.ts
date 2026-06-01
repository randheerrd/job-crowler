import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET   = process.env.JWT_SECRET   || 'secret';
const SERVER_URL   = process.env.SERVER_URL    || 'http://localhost:3001';

// ── Shared: find-or-create OAuth user, return JWT ────────────────────────────
async function oauthFindOrCreate(
  provider: 'google' | 'linkedin',
  email: string,
  name: string,
): Promise<string> {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: crypto.randomBytes(32).toString('hex'), // unusable placeholder
        profileData: JSON.stringify({ onboardingComplete: false, authProvider: provider }),
      },
    });
  } else {
    // Mark provider if not already set
    const profile = JSON.parse(user.profileData || '{}');
    if (!profile.authProvider) {
      profile.authProvider = provider;
      await prisma.user.update({ where: { id: user.id }, data: { profileData: JSON.stringify(profile) } });
    }
  }

  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${SERVER_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name  = profile.displayName || 'Google User';
        if (!email) return done(new Error('No email from Google'));
        const token = await oauthFindOrCreate('google', email, name);
        done(null, { token });
      } catch (e) {
        done(e as Error);
      }
    },
  ));
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user as Express.User));
}

router.get('/google', (req: Request, res: Response, next: express.NextFunction) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
    return;
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (req: Request, res: Response) => {
    const token = (req.user as { token: string })?.token;
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  },
);

// ── LinkedIn OAuth (manual — no outdated package needed) ──────────────────────
const LINKEDIN_AUTH  = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_ME    = 'https://api.linkedin.com/v2/userinfo';

// In-memory CSRF state store (good enough for stateless OAuth)
const linkedInStates = new Map<string, number>();

router.get('/linkedin', (req: Request, res: Response): void => {
  if (!process.env.LINKEDIN_CLIENT_ID) {
    res.redirect(`${FRONTEND_URL}/login?error=linkedin_not_configured`);
    return;
  }
  const state = crypto.randomBytes(16).toString('hex');
  linkedInStates.set(state, Date.now() + 10 * 60 * 1000); // 10 min expiry

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri:  `${SERVER_URL}/api/auth/linkedin/callback`,
    state,
    scope:         'openid profile email',
  });
  res.redirect(`${LINKEDIN_AUTH}?${params}`);
});

router.get('/linkedin/callback', async (req: Request, res: Response): Promise<void> => {
  const { code, state, error } = req.query as Record<string, string>;

  if (error || !code || !state) {
    res.redirect(`${FRONTEND_URL}/login?error=linkedin`);
    return;
  }

  const expiry = linkedInStates.get(state);
  if (!expiry || Date.now() > expiry) {
    res.redirect(`${FRONTEND_URL}/login?error=linkedin_state`);
    return;
  }
  linkedInStates.delete(state);

  try {
    // Exchange code for access token
    const tokenRes = await fetch(LINKEDIN_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  `${SERVER_URL}/api/auth/linkedin/callback`,
        client_id:     process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) throw new Error('No access token from LinkedIn');

    // Fetch profile via OpenID Connect userinfo
    const meRes = await fetch(LINKEDIN_ME, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = await meRes.json() as { email?: string; name?: string; given_name?: string; family_name?: string };
    const email = me.email;
    const name  = me.name || `${me.given_name || ''} ${me.family_name || ''}`.trim() || 'LinkedIn User';

    if (!email) throw new Error('No email from LinkedIn');

    const token = await oauthFindOrCreate('linkedin', email, name);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch {
    res.redirect(`${FRONTEND_URL}/login?error=linkedin`);
  }
});

// ── Password change ───────────────────────────────────────────────────────────
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const profile = JSON.parse(user.profileData || '{}');
    const isOAuthUser = !!profile.authProvider;

    // OAuth users can set a password without current password
    if (!isOAuthUser) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required' });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    // If OAuth user is now setting a local password, clear the provider flag
    if (isOAuthUser && currentPassword === undefined) {
      // Keep authProvider so we know they originally signed up via OAuth
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newHash },
    });

    res.json({ ok: true, message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ── Dev login (local only) ────────────────────────────────────────────────────
router.get('/dev-login', async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not available' });
    return;
  }
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Dev User',
          email: 'dev@local.dev',
          passwordHash: 'no-password',
          profileData: JSON.stringify({ onboardingComplete: true }),
        },
      });
    } else {
      const profile = user.profileData ? JSON.parse(user.profileData) : {};
      if (!profile.onboardingComplete) {
        profile.onboardingComplete = true;
        user = await prisma.user.update({
          where: { id: user.id },
          data: { profileData: JSON.stringify(profile) },
        });
      }
    }
    const profileData = user.profileData ? JSON.parse(user.profileData) : {};
    res.json({ token: 'dev-token', user: { id: user.id, name: user.name, email: user.email, profileData } });
  } catch {
    res.status(500).json({ error: 'Dev login failed' });
  }
});

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, profileData: null } });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: 'Email and password are required' }); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, profileData: user.profileData ? JSON.parse(user.profileData) : null },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileData: user.profileData ? JSON.parse(user.profileData) : null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
