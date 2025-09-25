import { NextAuthOptions } from "next-auth";
import type { User } from "@/lib/types";

// Mock user database - in production, this would be a real database
const mockUsers: User[] = [
  {
    id: "1",
    email: "student@landstede.nl",
    name: "Jan de Student",
    studentNumber: "12345678",
    role: "student",
    credits: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "admin@landstede.nl",
    name: "Admin User",
    role: "admin",
    credits: 999,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "development-secret-please-change-in-production",
  providers: [
    {
      id: "demo",
      name: "Demo Login",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        // For demo purposes, allow login with any email
        if (credentials?.email) {
          const isAdmin = credentials.role === 'admin';
          return {
            id: isAdmin ? "2" : "1",
            email: credentials.email,
            name: isAdmin ? "Admin User" : "Jan de Student",
            role: isAdmin ? "admin" : "student",
          };
        }
        return null;
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          const userWithRole = user as typeof user & { role?: 'student' | 'admin' };
          token.role = userWithRole.role;
          token.userId = user.id;
          
          // Get user data from mock database
          const dbUser = mockUsers.find(u => u.id === user.id);
          if (dbUser) {
            token.credits = dbUser.credits;
            token.studentNumber = dbUser.studentNumber;
          }
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token.userId) {
          const user = mockUsers.find(u => u.id === token.userId as string);
          if (user) {
            session.user = {
              ...session.user,
              id: user.id,
              role: user.role,
              credits: user.credits,
              studentNumber: user.studentNumber,
            };
          }
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'student' | 'admin';
      credits: number;
      studentNumber?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: 'student' | 'admin';
    credits?: number;
    studentNumber?: string;
    accessToken?: string;
  }
}