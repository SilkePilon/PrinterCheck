'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { mockPrintJobs, mockPrinters } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Timer,
  CreditCard,
  Play,
  Pause,
  X,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PrintJob } from '@/lib/types';

export default function MyPrints() {
  const { data: session } = useSession();
  const { printJobs, setPrintJobs, printers, setPrinters, updatePrintJob } = useAppStore();
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);

  useEffect(() => {
    setPrintJobs(mockPrintJobs);
    setPrinters(mockPrinters);
  }, [setPrintJobs, setPrinters]);

  const userId = session?.user?.id;

  // Filter jobs for current user
  const userJobs = printJobs.filter(job => job.userId === userId);

  // Categorize jobs
  const activeJobs = userJobs.filter(job => 
    ['pending', 'approved', 'printing'].includes(job.status)
  );
  const completedJobs = userJobs.filter(job => 
    job.status === 'completed'
  );
  const cancelledFailedJobs = userJobs.filter(job => 
    ['cancelled', 'failed'].includes(job.status)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'printing':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'In Wachtrij',
      approved: 'Goedgekeurd',
      printing: 'Aan het Printen',
      completed: 'Voltooid',
      failed: 'Mislukt',
      cancelled: 'Geannuleerd',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'printing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPrinterName = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    return printer?.name || 'Onbekende Printer';
  };

  const getQueuePosition = (job: PrintJob) => {
    const printerJobs = printJobs
      .filter(j => j.printerId === job.printerId && ['pending', 'approved'].includes(j.status))
      .sort((a, b) => a.priority - b.priority);
    
    return printerJobs.findIndex(j => j.id === job.id) + 1;
  };

  const canCancelJob = (job: PrintJob) => {
    return ['pending', 'approved'].includes(job.status);
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updatePrintJob(jobId, { status: 'cancelled', updatedAt: new Date() });
    } catch (error) {
      console.error('Failed to cancel job:', error);
      alert('Er ging iets mis bij het annuleren van de print.');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const JobRow = ({ job }: { job: PrintJob }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(job.status)}
            <div>
              <p className="font-medium">{job.fileName}</p>
              <p className="text-xs text-muted-foreground">{getPrinterName(job.printerId)}</p>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${getStatusColor(job.status)}`} />
          <span className="text-sm">{getStatusLabel(job.status)}</span>
          {['pending', 'approved'].includes(job.status) && (
            <Badge variant="outline" className="text-xs">
              #{getQueuePosition(job)} in wachtrij
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{job.creditCost} credits</div>
          {job.estimatedDuration && (
            <div className="text-xs text-muted-foreground">
              {formatDuration(job.estimatedDuration)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(job.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </Dialog>
          
          {canCancelJob(job) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Print Annuleren</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze print wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Nee, behouden</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCancelJob(job.id)}>
                    Ja, annuleren
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const stats = {
    totalJobs: userJobs.length,
    activeJobs: activeJobs.length,
    completedJobs: completedJobs.length,
    totalCreditsSpent: userJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + job.creditCost, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mijn 3D Prints</h1>
        <p className="text-muted-foreground">
          Bekijk je print geschiedenis en beheer actieve print aanvragen.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totaal Prints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actieve Prints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits Uitgegeven</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreditsSpent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Print Jobs Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Actieve Prints ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Voltooide Prints ({completedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="other">
            Geannuleerd & Mislukt ({cancelledFailedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actieve Print Aanvragen</CardTitle>
            </CardHeader>
            <CardContent>
              {activeJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Geen actieve prints</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Je hebt momenteel geen prints in de wachtrij.
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/print-requests'}>
                    Nieuwe Print Aanvragen
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Kosten</TableHead>
                      <TableHead>Aangemaakt</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeJobs
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voltooide Prints</CardTitle>
            </CardHeader>
            <CardContent>
              {completedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Geen voltooide prints</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Je voltooide prints verschijnen hier.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Kosten</TableHead>
                      <TableHead>Voltooid</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs
                      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
                      .map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geannuleerde & Mislukte Prints</CardTitle>
            </CardHeader>
            <CardContent>
              {cancelledFailedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Geen geannuleerde of mislukte prints</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Kosten</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelledFailedJobs
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Print Details</span>
              </DialogTitle>
              <DialogDescription>
                Gedetailleerde informatie over je print aanvraag.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Basis Informatie</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bestand:</span>
                      <span className="font-medium">{selectedJob.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Printer:</span>
                      <span className="font-medium">{getPrinterName(selectedJob.printerId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedJob.status)}
                        <span>{getStatusLabel(selectedJob.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Kosten & Tijd</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kosten:</span>
                      <span className="font-medium">{selectedJob.creditCost} credits</span>
                    </div>
                    {selectedJob.estimatedDuration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Geschatte tijd:</span>
                        <span className="font-medium">{formatDuration(selectedJob.estimatedDuration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioriteit:</span>
                      <span className="font-medium">#{selectedJob.priority}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="space-y-2">
                <h4 className="font-semibold">Tijdlijn</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aangemaakt:</span>
                    <span>{formatDate(selectedJob.createdAt)}</span>
                  </div>
                  {selectedJob.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gestart:</span>
                      <span>{formatDate(selectedJob.startedAt)}</span>
                    </div>
                  )}
                  {selectedJob.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voltooid:</span>
                      <span>{formatDate(selectedJob.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedJob.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Opmerkingen</h4>
                    <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                  </div>
                </>
              )}

              {/* Progress for printing jobs */}
              {selectedJob.status === 'printing' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Voortgang</h4>
                    <Progress value={65} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      Geschat nog 1u 30m te gaan
                    </p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              {canCancelJob(selectedJob) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Print Annuleren
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Print Annuleren</AlertDialogTitle>
                      <AlertDialogDescription>
                        Weet je zeker dat je deze print wilt annuleren?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nee, behouden</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        handleCancelJob(selectedJob.id);
                        setSelectedJob(null);
                      }}>
                        Ja, annuleren
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Sluiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}