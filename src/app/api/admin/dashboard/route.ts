import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch recent meetings with counts
    const meetings = await prisma.meeting.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        _count: {
          select: {
            enrollments: true,
            attendances: true,
          },
        },
      },
    });

    // Fetch dashboard stats
    const [totalMeetings, activeMeetings, totalStudents, totalAttendances] = await Promise.all([
      prisma.meeting.count(),
      prisma.meeting.count({ where: { isActive: true } }),
      prisma.student.count(),
      prisma.attendance.count(),
    ]);

    return NextResponse.json({
      meetings,
      stats: {
        totalMeetings,
        activeMeetings,
        totalStudents,
        totalAttendances,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
