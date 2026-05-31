import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import resumeRoutes from './routes/resumes';
import credentialRoutes from './routes/credentials';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
