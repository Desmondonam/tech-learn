import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid session' });

  if (req.method === 'GET') {
    const [courses, userEnrollments] = await Promise.all([
      prisma.course.findMany({
        include: { _count: { select: { modules: true, enrollments: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.courseEnrollment.findMany({
        where: { userId: payload.userId },
        select: { courseId: true },
      }),
    ]);
    const enrolledIds = new Set(userEnrollments.map(e => e.courseId));
    return res.status(200).json({
      courses: courses.map(c => ({
        ...c,
        moduleCount: c._count.modules,
        enrollmentCount: c._count.enrollments,
        enrolled: enrolledIds.has(c.id),
      })),
    });
  }

  if (req.method === 'POST') {
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { title, category, description, icon, color, instructor } = req.body;
    if (!title || !category || !description || !instructor) {
      return res.status(400).json({ error: 'title, category, description and instructor are required' });
    }
    const course = await prisma.course.create({
      data: { title, category, description, icon: icon || '📚', color: color || '#38bdf8', instructor },
    });
    return res.status(201).json({ course });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
