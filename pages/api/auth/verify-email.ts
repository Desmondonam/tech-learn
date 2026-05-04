import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token' });
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    if (new Date() > record.expiresAt) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      return res.status(400).json({ error: 'This verification link has expired. Please register again.' });
    }

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
    await prisma.emailVerificationToken.delete({ where: { token } });

    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}
