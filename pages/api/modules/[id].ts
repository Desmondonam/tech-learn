import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const { id } = req.query as { id: string };

  if (req.method === 'PUT') {
    const { title, description, topics, duration, order } = req.body;
    const updated = await prisma.courseModule.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(topics !== undefined && { topics }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
      },
    });
    return res.status(200).json({ module: updated });
  }

  if (req.method === 'DELETE') {
    await prisma.courseModule.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
