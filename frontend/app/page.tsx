'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { mockPrinters, mockPrintJobs } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeTogglerButton } from '@/components/theme-toggler';
import {
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Activity,
  LogOut,
  User,
  Ban,
} from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();
  const { printers, setPrinters, printJobs, setPrintJobs } = useAppStore();
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);

  useEffect(() => {
    setPrinters(mockPrinters);
    setPrintJobs(mockPrintJobs);
  }, [setPrinters, setPrintJobs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'printing':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'disabled':
        return <Ban className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      online: 'Beschikbaar',
      printing: 'Bezig',
      offline: 'Offline',
      maintenance: 'Onderhoud',
      disabled: 'Uitgeschakeld',
    };
    return labels[status] || status;
  };

  const getQueueLength = (printerId: string) => {
    return printJobs.filter(job => 
      job.printerId === printerId && 
      ['pending', 'approved', 'printing'].includes(job.status)
    ).length;
  };

  const handleReservePrinter = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (printer && printer.status === 'online') {
      alert(`Je hebt ${printer.name} gereserveerd! Ga naar de werkplaats om je print te starten.`);
    }
  };

  const userName = session?.user?.name || 'Gebruiker';
  const userRole = session?.user?.role || 'student';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Header with user info */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welkom, {userName}
            </h1>
            <p className="text-muted-foreground">Kies een 3D printer om te reserveren</p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeTogglerButton />
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {userRole === 'student' ? 'Student' : 'Admin'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      {/* Printer Cards Grid */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printers.map((printer) => {
            const queueLength = getQueueLength(printer.id);
            const isAvailable = printer.status === 'online';

            return (
              <Card 
                key={printer.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isAvailable ? 'ring-1 ring-green-200 hover:ring-green-400' : ''
                }`}
                onClick={() => isAvailable && setSelectedPrinter(printer.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Printer Icon */}
                  <div className="flex justify-center">
                    <Printer className="h-12 w-12 text-muted-foreground" />
                  </div>

                  {/* Printer Name */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {printer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{printer.brand}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center space-x-2">
                    {getStatusIcon(printer.status)}
                    <span className="text-sm font-medium">
                      {getStatusLabel(printer.status)}
                    </span>
                  </div>

                  {/* Queue Info */}
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {queueLength === 0 
                        ? 'Geen wachtrij' 
                        : `${queueLength} in wachtrij`
                      }
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    disabled={!isAvailable}
                    variant={isAvailable ? 'default' : 'secondary'}
                  >
                    {isAvailable ? 'Reserveer Printer' : getStatusLabel(printer.status)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Landstede MBO - 3D Print Center
        </p>
      </div>

      {/* Reservation Dialog */}
      {selectedPrinter && (
        <Dialog open={!!selectedPrinter} onOpenChange={() => setSelectedPrinter(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Printer Reserveren</DialogTitle>
              <DialogDescription>
                Weet je zeker dat je {printers.find(p => p.id === selectedPrinter)?.name} wilt reserveren?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Na reservering:
                    </p>
                    <ul className="mt-2 space-y-1 text-blue-700">
                      <li>• Ga naar {printers.find(p => p.id === selectedPrinter)?.location}</li>
                      <li>• Start je print handmatig aan de printer</li>
                      <li>• Je reservering is 30 minuten geldig</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPrinter(null)}>
                Annuleren
              </Button>
              <Button onClick={() => {
                handleReservePrinter(selectedPrinter);
                setSelectedPrinter(null);
              }}>
                Ja, Reserveren
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
