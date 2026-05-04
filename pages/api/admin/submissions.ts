import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const [pending, graded] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: { status: 'submitted', submittedAt: { not: null } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.assignmentSubmission.findMany({
      where: { status: 'graded' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    }),
  ]);

  return res.status(200).json({
    pending: pending.map(s => ({
      id: s.id, assignmentId: s.assignmentId, status: s.status,
      grade: s.grade, feedback: s.feedback,
      submittedAt: s.submittedAt?.toISOString() ?? null,
      submissionText: s.submissionText,
      user: s.user,
    })),
    graded: graded.map(s => ({
      id: s.id, assignmentId: s.assignmentId, status: s.status,
      grade: s.grade, feedback: s.feedback,
      submittedAt: s.submittedAt?.toISOString() ?? null,
      submissionText: s.submissionText,
      user: s.user,
    })),
  });
}
