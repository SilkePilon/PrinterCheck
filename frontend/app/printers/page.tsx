'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { mockPrinters, mockPrintJobs } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Activity,
  AlertTriangle,
  MapPin,
  Calendar,
  Timer,
  Users,
  TrendingUp,
  Ban,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Printers() {
  const { data: session } = useSession();
  const router = useRouter();
  const { printers, setPrinters, printJobs, setPrintJobs } = useAppStore();

  useEffect(() => {
    setPrinters(mockPrinters);
    setPrintJobs(mockPrintJobs);
  }, [setPrinters, setPrintJobs]);

  const userRole = session?.user?.role || 'student';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'printing':
        return 'bg-blue-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'disabled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      online: 'Beschikbaar',
      printing: 'Aan het printen',
      offline: 'Offline',
      maintenance: 'Onderhoud',
      disabled: 'Uitgeschakeld',
    };
    return labels[status] || status;
  };

  const getPrinterQueue = (printerId: string) => {
    return printJobs
      .filter(job => 
        job.printerId === printerId && 
        ['pending', 'approved', 'printing'].includes(job.status)
      )
      .sort((a, b) => a.priority - b.priority);
  };

  const getCurrentJob = (printerId: string) => {
    return printJobs.find(job => 
      job.printerId === printerId && 
      job.status === 'printing'
    );
  };

  const getPrinterStats = (printerId: string) => {
    const printerJobs = printJobs.filter(job => job.printerId === printerId);
    const completedJobs = printerJobs.filter(job => job.status === 'completed');
    const totalPrintTime = completedJobs.reduce((sum, job) => 
      sum + (job.estimatedDuration || 0), 0
    );
    
    return {
      totalJobs: printerJobs.length,
      completedJobs: completedJobs.length,
      averageDuration: completedJobs.length > 0 ? 
        Math.round(totalPrintTime / completedJobs.length) : 0,
      successRate: printerJobs.length > 0 ? 
        Math.round((completedJobs.length / printerJobs.length) * 100) : 0,
    };
  };

  const handleSelectPrinter = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (printer && printer.status === 'online') {
      router.push('/print-requests');
    }
  };

  // Group printers by brand
  const bambuPrinters = printers.filter(p => p.brand === 'Bambu Lab X1C');
  const ultimakerPrinters = printers.filter(p => p.brand === 'Ultimaker');

  const overallStats = {
    totalPrinters: printers.length,
    onlinePrinters: printers.filter(p => p.status === 'online').length,
    activePrints: printers.filter(p => p.status === 'printing').length,
    maintenancePrinters: printers.filter(p => p.status === 'maintenance').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">3D Printers</h1>
        <p className="text-muted-foreground">
          Bekijk beschikbare printers en hun status.
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totaal Printers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Printer className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{overallStats.totalPrinters}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Beschikbaar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{overallStats.onlinePrinters}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bezig met Printen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold">{overallStats.activePrints}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onderhoud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold">{overallStats.maintenancePrinters}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printers by Brand */}
      <Tabs defaultValue="bambu" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bambu">
            Bambu Lab X1C ({bambuPrinters.length})
          </TabsTrigger>
          <TabsTrigger value="ultimaker">
            Ultimaker ({ultimakerPrinters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bambu" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bambuPrinters.map((printer) => {
              const queue = getPrinterQueue(printer.id);
              const currentJob = getCurrentJob(printer.id);
              const stats = getPrinterStats(printer.id);

              return (
                <Card key={printer.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{printer.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {printer.location}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(printer.status)}
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(printer.status)}`} />
                      <span className="text-sm font-medium">
                        {getStatusLabel(printer.status)}
                      </span>
                      {queue.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {queue.length} in wachtrij
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Current Job */}
                    {currentJob && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Huidige Print:</span>
                        </div>
                        <p className="text-sm">{currentJob.fileName}</p>
                        {printer.estimatedCompletionTime && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Voortgang</span>
                              <span>
                                Klaar om {new Date(printer.estimatedCompletionTime).toLocaleTimeString('nl-NL', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <Progress value={Math.random() * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Queue Preview */}
                    {queue.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Wachtrij Preview:</h4>
                        <div className="space-y-1">
                          {queue.slice(0, 3).map((job, index) => (
                            <div key={job.id} className="flex justify-between text-xs">
                              <span>#{index + 1}. {job.fileName}</span>
                              <Badge variant="outline" className="text-xs">
                                {job.creditCost} credits
                              </Badge>
                            </div>
                          ))}
                          {queue.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{queue.length - 3} meer...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{stats.completedJobs}</div>
                        <div className="text-xs text-muted-foreground">Voltooid</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{stats.successRate}%</div>
                        <div className="text-xs text-muted-foreground">Slagingspercentage</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleSelectPrinter(printer.id)}
                        disabled={printer.status !== 'online'}
                      >
                        {printer.status === 'online' 
                          ? 'Selecteer voor Print' 
                          : `Niet Beschikbaar (${getStatusLabel(printer.status)})`
                        }
                      </Button>
                      
                      {userRole === 'admin' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Beheer Printer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ultimaker" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ultimakerPrinters.map((printer) => {
              const queue = getPrinterQueue(printer.id);
              const currentJob = getCurrentJob(printer.id);
              const stats = getPrinterStats(printer.id);

              return (
                <Card key={printer.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{printer.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {printer.location}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(printer.status)}
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(printer.status)}`} />
                      <span className="text-sm font-medium">
                        {getStatusLabel(printer.status)}
                      </span>
                      {queue.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {queue.length} in wachtrij
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Current Job */}
                    {currentJob && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Huidige Print:</span>
                        </div>
                        <p className="text-sm">{currentJob.fileName}</p>
                        {printer.estimatedCompletionTime && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Voortgang</span>
                              <span>
                                Klaar om {new Date(printer.estimatedCompletionTime).toLocaleTimeString('nl-NL', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <Progress value={Math.random() * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Queue Preview */}
                    {queue.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Wachtrij Preview:</h4>
                        <div className="space-y-1">
                          {queue.slice(0, 3).map((job, index) => (
                            <div key={job.id} className="flex justify-between text-xs">
                              <span>#{index + 1}. {job.fileName}</span>
                              <Badge variant="outline" className="text-xs">
                                {job.creditCost} credits
                              </Badge>
                            </div>
                          ))}
                          {queue.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{queue.length - 3} meer...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{stats.completedJobs}</div>
                        <div className="text-xs text-muted-foreground">Voltooid</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{stats.successRate}%</div>
                        <div className="text-xs text-muted-foreground">Slagingspercentage</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleSelectPrinter(printer.id)}
                        disabled={printer.status !== 'online'}
                      >
                        {printer.status === 'online' 
                          ? 'Selecteer voor Print' 
                          : `Niet Beschikbaar (${getStatusLabel(printer.status)})`
                        }
                      </Button>
                      
                      {userRole === 'admin' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Beheer Printer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Live Wachtrij Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Printer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Huidige Print</TableHead>
                <TableHead>In Wachtrij</TableHead>
                <TableHead>Geschatte Wachttijd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printers.map((printer) => {
                const queue = getPrinterQueue(printer.id);
                const currentJob = getCurrentJob(printer.id);
                const estimatedWaitTime = queue.reduce((sum, job) => 
                  sum + (job.estimatedDuration || 60), 0
                );
                
                return (
                  <TableRow key={printer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(printer.status)}
                        <span>{printer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={printer.status === 'online' ? 'default' : 'secondary'}>
                        {getStatusLabel(printer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {currentJob ? (
                        <span className="text-sm">{currentJob.fileName}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Geen</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{queue.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {estimatedWaitTime > 0 ? (
                        <span className="text-sm">
                          ~{Math.floor(estimatedWaitTime / 60)}h {estimatedWaitTime % 60}m
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}