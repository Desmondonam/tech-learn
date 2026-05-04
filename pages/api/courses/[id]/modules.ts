import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  const { id: courseId } = req.query as { id: string };

  if (req.method === 'GET') {
    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    return res.status(200).json({ modules });
  }

  if (req.method === 'POST') {
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { title, description, topics, duration } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const count = await prisma.courseModule.count({ where: { courseId } });
    const created = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        description: description || '',
        topics: Array.isArray(topics) ? topics : [],
        duration: duration || '',
        order: count,
      },
    });
    return res.status(201).json({ module: created });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
