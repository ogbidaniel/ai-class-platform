'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import Spinner from '@/components/Spinner';
import { MEETING_ID_REGEX } from '@/contexts/AppProvider';

interface StudentInfoProps {
  params: {
    meetingId: string;
  };
}

const StudentInfo = ({ params }: StudentInfoProps) => {
  const { meetingId } = params;
  const validMeetingId = MEETING_ID_REGEX.test(meetingId);
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          meetingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to validate student');
        setLoading(false);
        return;
      }

      // Store student info in sessionStorage for the lobby
      sessionStorage.setItem('studentInfo', JSON.stringify({
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
        firstName,
        lastName,
        email,
      }));

      // Redirect to lobby
      router.push(`/${meetingId}`);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim().includes('@');

  if (!validMeetingId) {
    return (
      <div>
        <Header />
        <div className="w-full h-full flex flex-col items-center justify-center mt-[6.75rem]">
          <h1 className="text-4xl leading-[2.75rem] font-normal text-dark-gray tracking-normal mb-12">
            Invalid class code.
          </h1>
          <Button size="sm" onClick={() => router.push('/')}>
            Return to home screen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header navItems={false} />
      <main className="flex flex-col items-center justify-center px-6 py-12 max-w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl tracking-normal text-black pb-4">
              Join Your Class
            </h1>
            <p className="text-lg text-gray">
              Enter your information to access the classroom
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="space-y-4">
              <TextField
                label="First Name"
                name="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                label="Last Name"
                name="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="pt-4">
              {loading ? (
                <div className="h-14 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  rounding="lg"
                >
                  Continue to Lobby
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray">
            <p>
              Class code: <span className="font-mono font-semibold">{meetingId}</span>
            </p>
            <p className="mt-2">
              You must be enrolled to join this class
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentInfo;
