import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from 'passport';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import resumeRoutes from './routes/resumes';
import credentialRoutes from './routes/credentials';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import extensionRoutes from './routes/extension';
import sourcesRoutes from './routes/sources';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Allow same-origin web app + browser extension origins (moz-extension://, chrome-extension://)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl
    if (
      origin.startsWith('moz-extension://') ||
      origin.startsWith('chrome-extension://') ||
      origin.includes('localhost') ||
      origin.includes('job-crowler.onrender.com')
    ) return cb(null, true);
    cb(null, true); // open for now — tighten when going public
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 10 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/extension', extensionRoutes);
app.use('/api/sources', sourcesRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: String(e) });
  }
});

// Serve React app in production
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
