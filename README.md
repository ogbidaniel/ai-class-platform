# AI Class Platform

Virtual classroom application built with Next.js, TypeScript, and Stream SDKs. Provides video conferencing, student management, enrollment system, and attendance tracking with role-based access control.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Database Schema](#database-schema)
- [License](#license)

## Features

### Admin
- NextAuth-based authentication system
- Dashboard for class management
- Student enrollment via unique access tokens
- Attendance tracking (join/leave times, duration)
- Access control with token expiry and capacity limits
- Meeting analytics and history

### Student
- Token-based enrollment system
- Email MFA verification
- Pre-meeting lobby for device configuration
- Real-time video/audio via WebRTC
- In-meeting chat

### Video Conferencing
- Grid and speaker layout modes
- GSAP-animated layout transitions
- Screen sharing
- Meeting recordings
- Responsive UI

### Data Persistence
- SQLite database via Prisma ORM
- Relational schema for admins, students, meetings, enrollments, attendance

## Project Structure

```
ai-class-platform/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Database seeding script
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [meetingId]/      # Dynamic meeting routes
│   │   │   ├── page.tsx       # Meeting lobby
│   │   │   ├── layout.tsx
│   │   │   ├── meeting/
│   │   │   │   └── page.tsx   # Active meeting room
│   │   │   └── meeting-end/
│   │   │       └── page.tsx   # Post-meeting page
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Admin dashboard
│   │   │   └── login/
│   │   │       └── page.tsx   # Admin login
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── dashboard/
│   │   │   │       └── route.ts
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts  # NextAuth configuration
│   │   │   ├── token/
│   │   │   │   └── route.ts   # Stream token generation
│   │   │   └── user/
│   │   │       └── route.ts   # User management
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Client-side providers
│   ├── components/            # React components
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── CallControlButton.tsx
│   │   ├── CallParticipants.tsx
│   │   ├── ChatPopup.tsx
│   │   ├── DeviceSelector.tsx
│   │   ├── GridLayout.tsx
│   │   ├── MeetingPreview.tsx
│   │   ├── ParticipantViewUI.tsx
│   │   ├── RecordingsPopup.tsx
│   │   ├── SpeakerLayout.tsx
│   │   ├── ToggleAudioButton.tsx
│   │   ├── ToggleVideoButton.tsx
│   │   └── icons/             # SVG icon components
│   ├── contexts/              # React contexts
│   │   ├── AppProvider.tsx    # Global app state
│   │   └── MeetProvider.tsx   # Meeting-specific state
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAnimateVideoLayout.tsx
│   │   ├── useClickOutside.tsx
│   │   ├── useLocalStorage.tsx
│   │   ├── useSoundDetected.tsx
│   │   └── useTime.tsx
│   └── lib/                   # Utilities
│       ├── auth.ts            # NextAuth configuration
│       └── prisma.ts          # Prisma client singleton
├── .env.local                 # Environment variables (not tracked)
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Stream Account**: Sign up for a free account at [Stream](https://getstream.io/)
- **Database**: SQLite (included) or upgrade to PostgreSQL for production

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ogbidaniel/ai-class-platform.git
   cd ai-class-platform
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Stream Dashboard**
   
   - Create a new Stream app with video calling and chat messaging enabled
   - Update Permissions:
      - Navigate to **Roles & Permissions** under **Chat messaging**
      - Select the **user** role and **messaging** scope
      - Edit permissions to enable:
         - **Create Message**
         - **Read Channel**
         - **Read Channel Members**
      - Save and confirm changes

4. **Set Up Environment Variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Stream API Keys
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Database
   DATABASE_URL="file:./dev.db"
   ```

5. **Initialize Database**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

   This will create the database schema and seed an admin account.

## Usage

### For Administrators

1. **Start the Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`.

2. **Login to Admin Dashboard**

   - Visit `http://localhost:3000/admin/login`
   - Use the seeded admin credentials (check `prisma/seed.ts`)
   - Access the dashboard at `http://localhost:3000/admin/dashboard`

3. **Create a Class**

   - From the admin dashboard, create a new meeting/class
   - Add a title, description, and optional schedule time
   - Set capacity limits if needed
   - Generate the unique meeting ID

4. **Enroll Students**

   - Add students to the class by email
   - System generates unique access tokens
   - Send enrollment links to students

### For Students

1. **Access Your Class**

   - Click the enrollment link received via email
   - Complete MFA verification if required
   - Configure audio/video settings in the lobby

2. **Join the Classroom**

   - Enter the virtual classroom
   - Attendance is automatically tracked
   - Participate via video, audio, and chat

## Technologies Used

### Core Framework
- **Next.js 14**: React framework with App Router for server-side rendering and routing
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Video & Chat
- **Stream Video SDK**: Real-time video calling with WebRTC
- **Stream Chat SDK**: Real-time messaging and chat functionality
- **GSAP**: High-performance animations for layout transitions

### Authentication & Database
- **NextAuth.js**: Flexible authentication for admin accounts
- **Prisma ORM**: Type-safe database access and migrations
- **SQLite**: Lightweight database (upgradeable to PostgreSQL)
- **bcryptjs**: Secure password hashing

### Utilities
- **nanoid**: Secure unique ID generation for meetings
- **svix**: Webhook verification (for future integrations)

## Database Schema

The platform uses a relational database with four main models:

- **Admin**: Administrator accounts with secure authentication
- **Student**: Student profiles with MFA support and status tracking
- **Meeting**: Virtual classroom sessions with scheduling and access control
- **Enrollment**: Links students to meetings with unique access tokens
- **Attendance**: Automatic tracking of participation and duration

See `prisma/schema.prisma` for the complete schema definition.

## Roadmap

- Email service integration for enrollment notifications
- Payment processing
- Analytics dashboard with visualization
- Camera verification and screenshot capture
- Document upload system
- Multi-role support (super admin, instructor, TA)
- LMS platform integrations

## License

This project is licensed under the [MIT License](LICENSE).
