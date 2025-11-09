import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();

const generateMeetingId = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 4);
  return `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
};

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
    {
      email: 'test.student4@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      phone: '555-0103',
    },
    {
      email: 'test.student5@example.com',
      firstName: 'David',
      lastName: 'Brown',
      phone: '555-0104',
    },
  ];

  const createdStudents = [];
  for (const student of students) {
    const created = await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: student,
    });
    createdStudents.push(created);
    console.log(`  ✅ Student: ${created.firstName} ${created.lastName} (${created.email})`);
  }

  // Create Test Meetings
  console.log('\nCreating test meetings...');
  const meetings = [
    {
      id: generateMeetingId(),
      title: 'DWI Class - Session 1',
      description: 'Introduction to DWI Education Program',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdBy: admins[0].email,
      maxStudents: 20,
    },
    {
      id: generateMeetingId(),
      title: 'DWI Class - Session 2',
      description: 'Understanding the Impact of Alcohol',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      createdBy: admins[1].email,
      maxStudents: 20,
    },
    {
      id: generateMeetingId(),
      title: 'DWI Class - Session 3',
      description: 'Legal Consequences and Responsibilities',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In a week
      createdBy: admins[0].email,
      maxStudents: 15,
    },
  ];

  const createdMeetings = [];
  for (const meeting of meetings) {
    const created = await prisma.meeting.upsert({
      where: { id: meeting.id },
      update: {},
      create: meeting,
    });
    createdMeetings.push(created);
    console.log(`  ✅ Meeting: ${created.title} (${created.id})`);
  }

  // Enroll all students in all meetings
  console.log('\nEnrolling students in meetings...');
  const { v4: uuidv4 } = await import('crypto').then(m => ({ v4: () => {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }}));

  for (const meeting of createdMeetings) {
    for (const student of createdStudents) {
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_meetingId: {
            studentId: student.id,
            meetingId: meeting.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          meetingId: meeting.id,
          accessToken: `${student.id}-${meeting.id}-${Date.now()}`.slice(0, 64),
        },
      });
      console.log(`  ✅ Enrolled: ${student.firstName} ${student.lastName} in ${meeting.title}`);
    }
  }

  console.log('\n✅ Seeding completed!\n');
  console.log('Admin credentials:');
  console.log('  Email: maverickogbuigwe@gmail.com or jada.pegram@yahoo.com');
  console.log('  Password: Admin123!\n');
  console.log('Test Students:');
  createdStudents.forEach(s => {
    console.log(`  - ${s.firstName} ${s.lastName} (${s.email})`);
  });
  console.log('\nTest Meetings:');
  createdMeetings.forEach(m => {
    console.log(`  - ${m.title} (Code: ${m.id})`);
  });
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
