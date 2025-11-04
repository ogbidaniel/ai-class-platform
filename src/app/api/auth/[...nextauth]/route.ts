import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing email or password');
          return null;
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });

          console.log('👤 Admin found in DB:', !!admin);

          if (admin) {
            const isValidPassword = await bcrypt.compare(
              credentials.password,
              admin.password
            );

            console.log('🔑 Password check result:', isValidPassword);

            if (isValidPassword) {
              console.log('✅ Login successful for:', admin.email);
              return {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
              };
            }
          }

          console.log('❌ Authentication failed');
          return null;
        } catch (error) {
          console.error('💥 Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

