import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  if (req.method === 'GET') {
    const pending = await prisma.moduleProgress.findMany({
      where: { status: 'submitted' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        module: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
    return res.status(200).json({ pending });
  }

  if (req.method === 'POST') {
    const { progressId, action, feedback } = req.body;
    if (!progressId || !action) return res.status(400).json({ error: 'progressId and action required' });
    if (action !== 'approve' && action !== 'reject') return res.status(400).json({ error: 'action must be approve or reject' });

    const progress = await prisma.moduleProgress.findUnique({
      where: { id: progressId },
      include: {
        module: {
          include: {
            course: { include: { modules: { orderBy: { order: 'asc' } } } },
          },
        },
      },
    });
    if (!progress) return res.status(404).json({ error: 'Progress record not found' });

    if (action === 'approve') {
      await prisma.$transaction(async (tx) => {
        await tx.moduleProgress.update({
          where: { id: progressId },
          data: { status: 'approved', approvedAt: new Date(), feedback: feedback || null },
        });

        const modules = progress.module.course.modules;
        const currentIdx = modules.findIndex(m => m.id === progress.moduleId);
        if (currentIdx < modules.length - 1) {
          const nextModule = modules[currentIdx + 1];
          const nextProgress = await tx.moduleProgress.findUnique({
            where: { userId_moduleId: { userId: progress.userId, moduleId: nextModule.id } },
          });
          if (nextProgress) {
            await tx.moduleProgress.update({
              where: { userId_moduleId: { userId: progress.userId, moduleId: nextModule.id } },
              data: { status: 'unlocked' },
            });
          } else {
            await tx.moduleProgress.create({
              data: {
                userId: progress.userId,
                moduleId: nextModule.id,
                courseId: progress.courseId,
                status: 'unlocked',
              },
            });
          }
        }
      });
    } else {
      await prisma.moduleProgress.update({
        where: { id: progressId },
        data: { status: 'unlocked', feedback: feedback || null },
      });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
