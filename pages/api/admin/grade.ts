import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { submissionId, grade, feedback } = req.body;
  if (!submissionId || grade === undefined || grade === null) {
    return res.status(400).json({ error: 'submissionId and grade are required' });
  }

  const gradeNum = parseInt(grade, 10);
  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
    return res.status(400).json({ error: 'Grade must be 0–100' });
  }

  const updated = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { grade: gradeNum, feedback: feedback || null, status: 'graded' },
    include: { user: { select: { name: true, email: true } } },
  });

  return res.status(200).json({ submission: updated });
}
