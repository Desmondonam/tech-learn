import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  const { id: moduleId } = req.query as { id: string };

  const progress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: payload.userId, moduleId } },
  });

  if (!progress) return res.status(404).json({ error: 'Module not found in your progress' });
  if (progress.status !== 'unlocked') {
    return res.status(400).json({ error: 'Module is not available for submission' });
  }

  await prisma.moduleProgress.update({
    where: { userId_moduleId: { userId: payload.userId, moduleId } },
    data: { status: 'submitted', submittedAt: new Date() },
  });

  return res.status(200).json({ ok: true });
}
