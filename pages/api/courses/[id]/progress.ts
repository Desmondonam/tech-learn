import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  const { id: courseId } = req.query as { id: string };

  const [modules, progress] = await Promise.all([
    prisma.courseModule.findMany({ where: { courseId }, orderBy: { order: 'asc' } }),
    prisma.moduleProgress.findMany({ where: { userId: payload.userId, courseId } }),
  ]);

  const progressMap = Object.fromEntries(progress.map(p => [p.moduleId, p]));

  return res.status(200).json({
    modules: modules.map(m => ({ ...m, progress: progressMap[m.id] || null })),
  });
}
