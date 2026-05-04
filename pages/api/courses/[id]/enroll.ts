import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  const { id: courseId } = req.query as { id: string };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: 'asc' } } },
  });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const existing = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId: payload.userId, courseId } },
  });
  if (existing) return res.status(400).json({ error: 'Already enrolled' });

  await prisma.$transaction(async (tx) => {
    await tx.courseEnrollment.create({ data: { userId: payload.userId, courseId } });
    for (let i = 0; i < course.modules.length; i++) {
      await tx.moduleProgress.create({
        data: {
          userId: payload.userId,
          moduleId: course.modules[i].id,
          courseId,
          status: i === 0 ? 'unlocked' : 'locked',
        },
      });
    }
  });

  return res.status(200).json({ ok: true });
}
