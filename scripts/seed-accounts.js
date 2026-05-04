/**
 * One-time script to seed the admin and demo student accounts.
 * Run with: node scripts/seed-accounts.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    {
      name: 'Desmond Onam',
      email: 'desmondonam@gmail.com',
      password: 'DesmondLMS@2026',
      role: 'admin',
    },
    {
      name: 'Demo Student',
      email: 'student@techlearn.com',
      password: 'Student@2026',
      role: 'student',
    },
  ];

  for (const account of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) {
      // Update password and ensure verified
      const hashed = await bcrypt.hash(account.password, 12);
      await prisma.user.update({
        where: { email: account.email },
        data: { password: hashed, emailVerified: true, role: account.role },
      });
      console.log(`✔ Updated: ${account.email}`);
    } else {
      const hashed = await bcrypt.hash(account.password, 12);
      await prisma.user.create({
        data: {
          name: account.name,
          email: account.email,
          password: hashed,
          role: account.role,
          emailVerified: true,
        },
      });
      console.log(`✔ Created: ${account.email} (${account.role})`);
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
