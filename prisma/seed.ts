import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create Admins
  console.log('Creating admins...');
  const admins = [
    {
      email: 'maverickogbuigwe@gmail.com',
      name: 'Daniel Ogbuigwe',
      password: 'Admin123!',
      role: 'super_admin',
    },
    {
      email: 'jada.pegram@yahoo.com',
      name: 'Jada Pegram',
      password: 'Admin123!',
      role: 'admin',
    },
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    
    const created = await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: admin.role,
      },
    });
    
    console.log(`  ✅ Admin: ${created.email} (${created.role})`);
  }

  // Create Test Students
  console.log('\nCreating test students...');
  const students = [
    {
      email: 'test.student1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-0100',
    },
    {
      email: 'test.student2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-0101',
    },
    {
      email: 'test.student3@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '555-0102',
    },
  ];

  for (const student of students) {
    const created = await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: student,
    });
    
    console.log(`  ✅ Student: ${created.firstName} ${created.lastName} (${created.email})`);
  }

  console.log('\n✅ Seeding completed!\n');
  console.log('Admin credentials:');
  console.log('  Email: maverickogbuigwe@gmail.com or jada.pegram@yahoo.com');
  console.log('  Password: Admin123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
