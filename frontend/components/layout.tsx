'use client';

import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg border">
          <div className="text-center">
            <Printer className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Landstede 3D Print Center
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo versie - kies je rol om in te loggen
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => signIn('demo', { email: 'student@landstede.nl', role: 'student' })}
              className="w-full"
              size="lg"
            >
              Inloggen als Student
            </Button>
            <Button
              onClick={() => signIn('demo', { email: 'admin@landstede.nl', role: 'admin' })}
              className="w-full"
              variant="outline"
              size="lg"
            >
              Inloggen als Admin
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Dit is een demo versie. In productie wordt Microsoft OAuth gebruikt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}