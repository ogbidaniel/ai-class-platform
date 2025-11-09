import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create or update attendance when student joins lobby
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, meetingId } = body;

    if (!studentId || !meetingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_meetingId: {
          studentId,
          meetingId,
        },
      },
    });

    if (existingAttendance) {
      // If they're rejoining, update the join time
      const attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          joinedAt: new Date(),
          leftAt: null, // Clear the left time on rejoin
          duration: null, // Will be recalculated when they leave
        },
      });

      return NextResponse.json({
        success: true,
        attendanceId: attendance.id,
        isRejoin: true,
      });
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        meetingId,
        joinedAt: new Date(),
      },
    });

    // Mark enrollment as joined
    await prisma.enrollment.updateMany({
      where: {
        studentId,
        meetingId,
      },
      data: {
        hasJoined: true,
      },
    });

    return NextResponse.json({
      success: true,
      attendanceId: attendance.id,
      isRejoin: false,
    });
  } catch (error) {
    console.error('Attendance creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update attendance when student leaves
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, meetingId, cameraEnabled, micEnabled } = body;

    if (!studentId || !meetingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        studentId_meetingId: {
          studentId,
          meetingId,
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Calculate duration in minutes
    const leftAt = new Date();
    const duration = Math.floor(
      (leftAt.getTime() - attendance.joinedAt.getTime()) / (1000 * 60)
    );

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        leftAt,
        duration,
        cameraEnabled: cameraEnabled ?? attendance.cameraEnabled,
        micEnabled: micEnabled ?? attendance.micEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      duration,
    });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
