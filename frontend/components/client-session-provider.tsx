'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import type { Session } from 'next-auth';
interface ClientSessionProviderProps {
  children: ReactNode;
  session?: Session | null | undefined;
}

export default function ClientSessionProvider({ children, session }: ClientSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}