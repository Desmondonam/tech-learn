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

  const [
    students,
    courses,
    submissionCounts,
    recentSubmissions,
    gradedSubmissions,
    moduleStats,
  ] = await Promise.all([
    // All students with per-student stats
    prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true, name: true, email: true, githubUsername: true, joinDate: true,
        courseEnrollments: { select: { courseId: true } },
        assignmentSubmissions: {
          select: { status: true, grade: true, submittedAt: true },
        },
      },
      orderBy: { joinDate: 'desc' },
    }),

    // All courses with counts
    prisma.course.findMany({
      include: { _count: { select: { modules: true, enrollments: true } } },
      orderBy: { createdAt: 'asc' },
    }),

    // Submission status counts
    prisma.assignmentSubmission.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    // Recent 8 submissions with student name
    prisma.assignmentSubmission.findMany({
      where: { submittedAt: { not: null } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    }),

    // All graded submissions for grade distribution
    prisma.assignmentSubmission.findMany({
      where: { status: 'graded', grade: { not: null } },
      select: { grade: true },
    }),

    // Module progress grouped by course for analytics
    prisma.course.findMany({
      include: {
        modules: {
          include: {
            _count: { select: { progress: true } },
            progress: { select: { status: true } },
          },
        },
      },
    }),
  ]);

  // Build submission stats map
  const statsMap: Record<string, number> = {};
  for (const row of submissionCounts) statsMap[row.status] = row._count.status;

  // Build grade distribution
  const gradeBuckets = { a: 0, b: 0, c: 0, d: 0 };
  for (const s of gradedSubmissions) {
    const g = s.grade!;
    if (g >= 90) gradeBuckets.a++;
    else if (g >= 80) gradeBuckets.b++;
    else if (g >= 70) gradeBuckets.c++;
    else gradeBuckets.d++;
  }

  // Build per-course module stats
  const courseModuleStats = moduleStats.map(course => {
    const totalModules = course.modules.length;
    const approvedCount = course.modules.reduce((sum, m) =>
      sum + m.progress.filter(p => p.status === 'approved').length, 0);
    const submittedCount = course.modules.reduce((sum, m) =>
      sum + m.progress.filter(p => p.status === 'submitted').length, 0);
    const enrolledStudents = course.modules[0]?.progress.length ?? 0;
    return {
      courseId: course.id,
      courseTitle: course.title,
      courseIcon: course.icon,
      courseColor: course.color,
      totalModules,
      approvedCount,
      submittedCount,
      enrolledStudents,
    };
  });

  return res.status(200).json({
    students: students.map(s => {
      const graded = s.assignmentSubmissions.filter(a => a.status === 'graded' && a.grade !== null);
      const avgGrade = graded.length
        ? Math.round(graded.reduce((sum, a) => sum + a.grade!, 0) / graded.length)
        : null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        githubUsername: s.githubUsername,
        joinDate: s.joinDate,
        enrollmentCount: s.courseEnrollments.length,
        submissionCount: s.assignmentSubmissions.filter(a => a.submittedAt).length,
        avgGrade,
      };
    }),
    courses: courses.map(c => ({
      id: c.id, title: c.title, icon: c.icon, color: c.color,
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments,
    })),
    submissionStats: {
      total: Object.values(statsMap).reduce((a, b) => a + b, 0),
      pending: statsMap['pending'] ?? 0,
      submitted: statsMap['submitted'] ?? 0,
      graded: statsMap['graded'] ?? 0,
    },
    recentSubmissions: recentSubmissions.map(s => ({
      id: s.id,
      assignmentId: s.assignmentId,
      status: s.status,
      grade: s.grade,
      submittedAt: s.submittedAt?.toISOString() ?? null,
      submissionText: s.submissionText,
      user: s.user,
    })),
    gradedTotal: gradedSubmissions.length,
    gradeBuckets,
    courseModuleStats,
  });
}
