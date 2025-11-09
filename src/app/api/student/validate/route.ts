import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, meetingId } = body;

    if (!email || !firstName || !lastName || !meetingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the student by email
    const student = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found. Please contact your instructor.' },
        { status: 404 }
      );
    }

    // Check if student is active
    if (!student.isActive) {
      return NextResponse.json(
        { error: 'Your account is inactive. Please contact your instructor.' },
        { status: 403 }
      );
    }

    // Verify the meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    if (!meeting.isActive) {
      return NextResponse.json(
        { error: 'This class is no longer active' },
        { status: 403 }
      );
    }

    // Check if student is enrolled in this meeting
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_meetingId: {
          studentId: student.id,
          meetingId: meetingId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this class. Please contact your instructor.' },
        { status: 403 }
      );
    }

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      studentId: student.id,
      enrollmentId: enrollment.id,
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    });
  } catch (error) {
    console.error('Student validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
