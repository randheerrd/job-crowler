import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(authMiddleware);

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'Kotlin', 'Swift',
  'Go', 'Rust', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'PHP', 'Laravel',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'GraphQL', 'REST',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'Linux',
  'Microservices', 'TDD', 'Agile', 'Scrum', 'Machine Learning', 'AI',
  'TensorFlow', 'PyTorch', 'SQL', 'HTML', 'CSS', 'Tailwind', 'Sass',
  'React Native', 'Flutter', 'Figma', 'Webpack', 'Vite', 'Next.js', 'Nest.js',
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter(skill => lower.includes(skill.toLowerCase()));
}

async function parseFile(filePath: string, ext: string): Promise<string> {
  try {
    if (ext === '.pdf') {
      // Dynamic import to avoid issues with pdf-parse module loading
      const pdfParse = await import('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse.default(buffer);
      return data.text;
    }
    if (ext === '.docx' || ext === '.doc') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
  } catch (e) {
    console.error('Parse error:', e);
  }
  return '';
}

router.post('/', upload.single('resume'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const text = await parseFile(req.file.path, ext);
    const skills = extractSkills(text);

    // Remove previous resume for this user
    await prisma.resume.deleteMany({ where: { userId: req.userId } });

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        filePath: req.file.path,
        extractedSkills: JSON.stringify(skills),
      },
    });

    res.status(201).json({
      id: resume.id,
      filePath: resume.filePath,
      extractedSkills: skills,
      createdAt: resume.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Resume upload failed' });
  }
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      res.status(404).json({ error: 'No resume found' });
      return;
    }

    res.json({
      id: resume.id,
      filePath: resume.filePath,
      extractedSkills: JSON.parse(resume.extractedSkills),
      createdAt: resume.createdAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

router.put('/:id/skills', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      res.status(400).json({ error: 'Skills must be an array' });
      return;
    }

    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const updated = await prisma.resume.update({
      where: { id: req.params.id },
      data: { extractedSkills: JSON.stringify(skills) },
    });

    res.json({
      id: updated.id,
      filePath: updated.filePath,
      extractedSkills: JSON.parse(updated.extractedSkills),
      createdAt: updated.createdAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

export default router;
