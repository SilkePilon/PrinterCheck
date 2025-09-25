'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { mockPrinters, mockPrintJobs, mockUsers } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  Power,
  PowerOff,
  Wrench,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  MoreHorizontal,
  Eye,
  Ban,
  Play,
  UserX,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Printer as PrinterType, User, PrintJob } from '@/lib/types';

export default function AdminPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const { 
    printers, 
    setPrinters, 
    printJobs, 
    setPrintJobs, 
    addPrinter, 
    updatePrinter, 
    deletePrinter,
    updatePrintJob 
  } = useAppStore();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedTab, setSelectedTab] = useState('printers');
  const [isAddingPrinter, setIsAddingPrinter] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [newPrinter, setNewPrinter] = useState<Partial<PrinterType>>({
    name: '',
    brand: 'Bambu Lab X1C',
    status: 'online',
    location: '',
    description: '',
  });

  useEffect(() => {
    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    setPrinters(mockPrinters);
    setPrintJobs(mockPrintJobs);
    setUsers(mockUsers);
  }, [session, router, setPrinters, setPrintJobs]);

  if (session?.user?.role !== 'admin') {
    return null;
  }

  const handleAddPrinter = async () => {
    if (!newPrinter.name || !newPrinter.brand) return;

    const printer: PrinterType = {
      id: Date.now().toString(),
      name: newPrinter.name,
      brand: newPrinter.brand as 'Bambu Lab X1C' | 'Ultimaker',
      status: newPrinter.status as PrinterType['status'],
      location: newPrinter.location || '',
      description: newPrinter.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addPrinter(printer);
    setNewPrinter({
      name: '',
      brand: 'Bambu Lab X1C',
      status: 'online',
      location: '',
      description: '',
    });
    setIsAddingPrinter(false);
  };

  const handleEditPrinter = async () => {
    if (!editingPrinter) return;

    updatePrinter(editingPrinter.id, {
      ...editingPrinter,
      updatedAt: new Date(),
    });
    setEditingPrinter(null);
  };

  const handleDeletePrinter = (printerId: string) => {
    // Check if printer has active jobs
    const activeJobs = printJobs.filter(job => 
      job.printerId === printerId && 
      ['pending', 'approved', 'printing'].includes(job.status)
    );

    if (activeJobs.length > 0) {
      alert('Kan printer niet verwijderen: er zijn nog actieve print jobs.');
      return;
    }

    deletePrinter(printerId);
  };

  const handleUpdatePrinterStatus = (printerId: string, status: PrinterType['status']) => {
    updatePrinter(printerId, { status, updatedAt: new Date() });
  };

  const handleUpdateJobStatus = (jobId: string, status: string) => {
    updatePrintJob(jobId, { status: status as PrintJob['status'], updatedAt: new Date() });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'printing':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'disabled':
        return <Ban className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQueueLength = (printerId: string) => {
    return printJobs.filter(job => 
      job.printerId === printerId && 
      ['pending', 'approved', 'printing'].includes(job.status)
    ).length;
  };

  const stats = {
    totalPrinters: printers.length,
    onlinePrinters: printers.filter(p => p.status === 'online').length,
    activePrints: printJobs.filter(j => j.status === 'printing').length,
    pendingJobs: printJobs.filter(j => j.status === 'pending').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.role === 'student').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Beheer printers, gebruikers en print aanvragen.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Printers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrinters}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onlinePrinters}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actieve Prints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePrints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Wachtrij</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gebruikers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Studenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="printers">Printers</TabsTrigger>
          <TabsTrigger value="queue">Print Wachtrij</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
        </TabsList>

        {/* Printers Tab */}
        <TabsContent value="printers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Printer Beheer</h2>
            <Dialog open={isAddingPrinter} onOpenChange={setIsAddingPrinter}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Printer Toevoegen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nieuwe Printer Toevoegen</DialogTitle>
                  <DialogDescription>
                    Voeg een nieuwe 3D printer toe aan het systeem.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input
                      id="name"
                      value={newPrinter.name || ''}
                      onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                      placeholder="Bijv. Bambu Lab X1C #4"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Merk</Label>
                    <Select 
                      value={newPrinter.brand} 
                      onValueChange={(value) => setNewPrinter({ ...newPrinter, brand: value as 'Bambu Lab X1C' | 'Ultimaker' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bambu Lab X1C">Bambu Lab X1C</SelectItem>
                        <SelectItem value="Ultimaker">Ultimaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Locatie</Label>
                    <Input
                      id="location"
                      value={newPrinter.location || ''}
                      onChange={(e) => setNewPrinter({ ...newPrinter, location: e.target.value })}
                      placeholder="Bijv. Lab A - Werkplaats 1"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      value={newPrinter.description || ''}
                      onChange={(e) => setNewPrinter({ ...newPrinter, description: e.target.value })}
                      placeholder="Optionele beschrijving..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingPrinter(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleAddPrinter}>
                    Printer Toevoegen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {printers.map((printer) => (
              <Card key={printer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{printer.name}</CardTitle>
                    {getStatusIcon(printer.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {printer.brand}
                    </Badge>
                    <Badge variant="outline">
                      {getQueueLength(printer.id)} in wachtrij
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">{printer.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Locatie:</span>
                      <span className="font-medium">{printer.location}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setEditingPrinter(printer)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Bewerken
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleUpdatePrinterStatus(printer.id, 'online')}
                          disabled={printer.status === 'online'}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          Online Zetten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdatePrinterStatus(printer.id, 'offline')}
                          disabled={printer.status === 'offline'}
                        >
                          <PowerOff className="mr-2 h-4 w-4" />
                          Offline Zetten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdatePrinterStatus(printer.id, 'maintenance')}
                          disabled={printer.status === 'maintenance'}
                        >
                          <Wrench className="mr-2 h-4 w-4" />
                          Onderhoud
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdatePrinterStatus(printer.id, 'disabled')}
                          disabled={printer.status === 'disabled'}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Uitschakelen
                        </DropdownMenuItem>
                        <Separator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Printer Verwijderen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Weet je zeker dat je {printer.name} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuleren</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePrinter(printer.id)}>
                                Verwijderen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Printer Dialog */}
          {editingPrinter && (
            <Dialog open={!!editingPrinter} onOpenChange={() => setEditingPrinter(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Printer Bewerken</DialogTitle>
                  <DialogDescription>
                    Bewerk de instellingen van {editingPrinter.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Naam</Label>
                    <Input
                      id="edit-name"
                      value={editingPrinter.name}
                      onChange={(e) => setEditingPrinter({ ...editingPrinter, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Locatie</Label>
                    <Input
                      id="edit-location"
                      value={editingPrinter.location || ''}
                      onChange={(e) => setEditingPrinter({ ...editingPrinter, location: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Beschrijving</Label>
                    <Textarea
                      id="edit-description"
                      value={editingPrinter.description || ''}
                      onChange={(e) => setEditingPrinter({ ...editingPrinter, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingPrinter(null)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleEditPrinter}>
                    Opslaan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Print Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volledige Print Wachtrij</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bestand</TableHead>
                    <TableHead>Gebruiker</TableHead>
                    <TableHead>Printer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kosten</TableHead>
                    <TableHead>Aangemaakt</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printJobs
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((job) => {
                      const user = users.find(u => u.id === job.userId);
                      const printer = printers.find(p => p.id === job.printerId);
                      
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.fileName}</TableCell>
                          <TableCell>{user?.name || 'Onbekend'}</TableCell>
                          <TableCell>{printer?.name || 'Onbekende Printer'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.status}</Badge>
                          </TableCell>
                          <TableCell>{job.creditCost} credits</TableCell>
                          <TableCell>
                            {new Date(job.createdAt).toLocaleDateString('nl-NL')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {job.status === 'pending' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateJobStatus(job.id, 'approved')}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Goedkeuren
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'approved' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateJobStatus(job.id, 'printing')}
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Printen
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'printing' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUpdateJobStatus(job.id, 'completed')}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Markeer Voltooid
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateJobStatus(job.id, 'cancelled')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Annuleren
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gebruikers Beheer</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Studentnummer</TableHead>
                    <TableHead>Geregistreerd</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role === 'admin' ? 'Admin' : 'Student'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.credits}</TableCell>
                      <TableCell>{user.studentNumber || '-'}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Bekijk Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Credits Beheren
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Deactiveren
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Systeem Instellingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Print Instellingen</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Maximum Bestandsgrootte (MB)</Label>
                    <Input id="max-file-size" type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit-rate">Credits per Uur</Label>
                    <Input id="credit-rate" type="number" defaultValue="5" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Notificatie Instellingen</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notificaties</Label>
                      <p className="text-sm text-muted-foreground">
                        Stuur emails bij belangrijke events
                      </p>
                    </div>
                    <input type="checkbox" id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="job-completion">Print Voltooiing Meldingen</Label>
                      <p className="text-sm text-muted-foreground">
                        Meld gebruikers wanneer hun print klaar is
                      </p>
                    </div>
                    <input type="checkbox" id="job-completion" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset naar Standaard</Button>
                <Button>Instellingen Opslaan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}