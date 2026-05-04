import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  try {
    const [enrollments, submissions, challengeSubmissions] = await Promise.all([
      prisma.enrollment.findMany({ where: { userId: payload.userId } }),
      prisma.assignmentSubmission.findMany({ where: { userId: payload.userId } }),
      prisma.challengeSubmission.findMany({ where: { userId: payload.userId } }),
    ]);

    return res.status(200).json({ enrollments, submissions, challengeSubmissions });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard data' });
  }
}
