'use client';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CallingState,
  CallParticipantResponse,
  ErrorFromResponse,
  GetCallResponse,
  useCall,
  useCallStateHooks,
  useConnectedUser,
} from '@stream-io/video-react-sdk';
import { useChatContext } from 'stream-chat-react';
import { useSession } from 'next-auth/react';

import { AppContext, MEETING_ID_REGEX } from '@/contexts/AppProvider';
import { GUEST_ID, tokenProvider } from '@/contexts/MeetProvider';
import Button from '@/components/Button';
import CallParticipants from '@/components/CallParticipants';
import Header from '@/components/Header';
import MeetingPreview from '@/components/MeetingPreview';
import Spinner from '@/components/Spinner';

interface LobbyProps {
  params: {
    meetingId: string;
  };
}

const Lobby = ({ params }: LobbyProps) => {
  const { meetingId } = params;
  const validMeetingId = MEETING_ID_REGEX.test(meetingId);
  const { newMeeting, setNewMeeting } = useContext(AppContext);
  const { client: chatClient } = useChatContext();
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated';
  const isAdmin = isSignedIn; // All signed-in users are admins
  const router = useRouter();
  const connectedUser = useConnectedUser();
  const call = useCall();
  const { useCallCallingState, useCameraState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { camera, hasBrowserPermission: hasCameraPermission } = useCameraState();
  const [errorFetchingMeeting, setErrorFetchingMeeting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [participants, setParticipants] = useState<CallParticipantResponse[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  // Check for student info in sessionStorage
  useEffect(() => {
    if (!isAdmin) {
      const storedInfo = sessionStorage.getItem('studentInfo');
      if (!storedInfo) {
        // Redirect to student info page if not an admin and no student info
        router.push(`/${meetingId}/student-info`);
        return;
      }
      setStudentInfo(JSON.parse(storedInfo));
    }
  }, [isAdmin, meetingId, router]);

  // Track attendance when student enters lobby
  useEffect(() => {
    const trackAttendance = async () => {
      if (studentInfo && !attendanceId) {
        try {
          const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: studentInfo.studentId,
              meetingId,
            }),
          });

          const data = await response.json();
          if (data.success) {
            setAttendanceId(data.attendanceId);
            console.log('Attendance tracked:', data.isRejoin ? 'Rejoined' : 'First join');
          }
        } catch (error) {
          console.error('Failed to track attendance:', error);
        }
      }
    };

    trackAttendance();
  }, [studentInfo, meetingId, attendanceId]);

  useEffect(() => {
    const leavePreviousCall = async () => {
      if (callingState === CallingState.JOINED) {
        await call?.leave();
      }
    };

    const getCurrentCall = async () => {
      try {
        const callData = await call?.get();
        setParticipants(callData?.call?.session?.participants || []);
      } catch (e) {
        const err = e as ErrorFromResponse<GetCallResponse>;
        console.error(err.message);
        
        // If call doesn't exist in Stream (404), create it
        if (err.status === 404 && isAdmin) {
          console.log('Call not found in Stream, creating it...');
          await createCall();
          return;
        }
        
        setErrorFetchingMeeting(true);
      }
      setLoading(false);
    };

    const createCall = async () => {
      await call?.create({
        data: {
          members: [
            {
              user_id: connectedUser?.id!,
              role: 'host',
            },
          ],
        },
      });
      setLoading(false);
    };

    if (!joining && validMeetingId) {
      leavePreviousCall();
      if (!connectedUser) return;
      if (newMeeting) {
        createCall();
      } else {
        getCurrentCall();
      }
    }
  }, [call, callingState, connectedUser, joining, newMeeting, validMeetingId]);

  useEffect(() => {
    setNewMeeting(newMeeting);

    return () => {
      setNewMeeting(false);
    };
  }, [newMeeting, setNewMeeting]);

  const heading = useMemo(() => {
    if (loading) return 'Getting ready...';
    if (isAdmin) return 'Ready to join?';
    if (!hasCameraPermission) return 'Camera access required';
    return 'Ready to join your class?';
  }, [loading, isAdmin, hasCameraPermission]);

  const participantsUI = useMemo(() => {
    switch (true) {
      case loading:
        return "You'll be able to join in just a moment";
      case joining:
        return "You'll join the call in just a moment";
      case participants.length === 0:
        return 'No one else is here';
      case participants.length > 0:
        return <CallParticipants participants={participants} />;
      default:
        return null;
    }
  }, [loading, joining, participants]);

  const updateStudentName = async () => {
    if (!studentInfo) return;
    
    try {
      const fullName = `${studentInfo.firstName} ${studentInfo.lastName}`;
      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: { id: connectedUser?.id, name: fullName },
        }),
      });
      await chatClient.disconnectUser();
      await chatClient.connectUser(
        {
          id: GUEST_ID,
          type: 'guest',
          name: fullName,
        },
        tokenProvider
      );
    } catch (error) {
      console.error(error);
    }
  };

  const joinCall = async () => {
    setJoining(true);
    
    if (!isAdmin) {
      await updateStudentName();
    }
    
    if (callingState !== CallingState.JOINED) {
      await call?.join();
    }
    
    router.push(`/${meetingId}/meeting`);
  };

  // Determine if join button should be disabled
  const isJoinDisabled = useMemo(() => {
    if (loading || joining) return true;
    if (isAdmin) return false;
    // Students must have camera enabled
    return !hasCameraPermission || !camera;
  }, [loading, joining, isAdmin, hasCameraPermission, camera]);

  const cameraWarningMessage = useMemo(() => {
    if (isAdmin || hasCameraPermission) return null;
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg max-w-md text-center">
        <p className="font-semibold">Camera Required</p>
        <p className="text-sm mt-1">
          Please enable your camera to join the class. You can troubleshoot your camera settings below.
        </p>
      </div>
    );
  }, [isAdmin, hasCameraPermission]);

  if (!validMeetingId)
    return (
      <div>
        <Header />
        <div className="w-full h-full flex flex-col items-center justify-center mt-[6.75rem]">
          <h1 className="text-4xl leading-[2.75rem] font-normal text-dark-gray tracking-normal mb-12">
            Invalid video call name.
          </h1>
          <Button size="sm" onClick={() => router.push('/')}>
            Return to home screen
          </Button>
        </div>
      </div>
    );

  if (errorFetchingMeeting) {
    router.push(`/${meetingId}/meeting-end?invalid=true`);
  }

  return (
    <div>
      <Header navItems={false} />
      <main className="lg:h-[calc(100svh-80px)] p-4 mt-3 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
        <MeetingPreview />
        <div className="flex flex-col items-center lg:justify-center gap-4 grow-0 shrink-0 basis-112 h-135 mr-2 lg:mb-13">
          <h2 className="text-black text-3xl text-center truncate">
            {heading}
          </h2>
          {!isAdmin && studentInfo && (
            <div className="text-center">
              <p className="text-sm text-gray">Welcome,</p>
              <p className="font-semibold text-lg text-black">
                {studentInfo.firstName} {studentInfo.lastName}
              </p>
            </div>
          )}
          {cameraWarningMessage}
          <span className="text-meet-black font-medium text-center text-sm cursor-default">
            {participantsUI}
          </span>
          <div>
            {!joining && !loading && (
              <Button
                className="w-60 text-sm"
                onClick={joinCall}
                disabled={isJoinDisabled}
                rounding="lg"
              >
                {isJoinDisabled && !isAdmin ? 'Enable camera to join' : 'Join now'}
              </Button>
            )}
            {(joining || loading) && (
              <div className="h-14 pb-2.5">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
