import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.status(200).json({ course });
  }

  if (req.method === 'PUT') {
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { title, category, description, icon, color, instructor } = req.body;
    const course = await prisma.course.update({
      where: { id },
      data: { title, category, description, icon, color, instructor },
    });
    return res.status(200).json({ course });
  }

  if (req.method === 'DELETE') {
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await prisma.course.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
