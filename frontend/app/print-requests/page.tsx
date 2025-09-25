'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { mockPrinters } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Upload,
  FileText,
  Printer,
  CreditCard,
  AlertTriangle,
  Info,
  Send,
} from 'lucide-react';
import type { PrintRequestForm } from '@/lib/types';

export default function PrintRequests() {
  const { data: session } = useSession();
  const router = useRouter();
  const { printers, setPrinters, addPrintJob } = useAppStore();
  const [form, setForm] = useState<PrintRequestForm>({
    file: null,
    printerId: '',
    notes: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setPrinters(mockPrinters);
  }, [setPrinters]);

  const userCredits = session?.user?.credits || 0;
  const userId = session?.user?.id;

  const availablePrinters = printers.filter(printer => 
    printer.status === 'online' || printer.status === 'printing'
  );

  const selectedPrinter = printers.find(p => p.id === form.printerId);

  // Estimate print cost and time based on file size (mock calculation)
  const estimateJob = () => {
    if (!form.file) return { cost: 0, duration: 0 };
    
    const fileSizeKB = form.file.size / 1024;
    const baseCost = Math.max(5, Math.round(fileSizeKB / 100)); // Rough estimation
    const duration = Math.max(30, Math.round(fileSizeKB / 50)); // Minutes
    
    return { cost: Math.min(baseCost, 50), duration: Math.min(duration, 480) };
  };

  const { cost: estimatedCost, duration: estimatedDuration } = estimateJob();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.stl') || file.name.endsWith('.gcode')) {
        setForm({ ...form, file });
      } else {
        alert('Alleen .stl en .gcode bestanden zijn toegestaan.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setForm({ ...form, file: files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!form.file || !form.printerId || !userId) return;

    if (estimatedCost > userCredits) {
      alert('Je hebt niet genoeg credits voor deze print.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newJob = {
        id: Date.now().toString(),
        userId,
        printerId: form.printerId,
        fileName: form.file.name,
        status: 'pending' as const,
        priority: Date.now() % 5 + 1, // Random priority for demo
        creditCost: estimatedCost,
        estimatedDuration: estimatedDuration,
        notes: form.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPrintJob(newJob);
      
      // Reset form
      setForm({ file: null, printerId: '', notes: '' });
      setShowConfirmDialog(false);
      
      // Redirect to my prints page
      router.push('/my-prints');
    } catch (error) {
      console.error('Failed to submit print job:', error);
      alert('Er ging iets mis bij het indienen van je print aanvraag.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = form.file && form.printerId && estimatedCost <= userCredits;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nieuwe Print Aanvraag</h1>
        <p className="text-muted-foreground">
          Upload je 3D model en dien een print aanvraag in.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Bestand Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {form.file ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <div>
                      <p className="font-medium">{form.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(form.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({ ...form, file: null })}
                    >
                      Verwijder Bestand
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">
                        Sleep je bestand hierheen of klik om te uploaden
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ondersteunde formaten: .stl, .gcode (max 50MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept=".stl,.gcode"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Selecteer Bestand</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Printer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Printer className="h-5 w-5" />
                <span>Printer Selectie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printer">Kies een printer</Label>
                <Select value={form.printerId} onValueChange={(value) => setForm({ ...form, printerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een printer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{printer.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {printer.status === 'online' ? 'Beschikbaar' : 'Bezig'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPrinter && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm">{selectedPrinter.brand}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Locatie:</span>
                    <span className="text-sm">{selectedPrinter.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={selectedPrinter.status === 'online' ? 'default' : 'secondary'}>
                      {selectedPrinter.status === 'online' ? 'Beschikbaar' : 'Bezig'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Opmerkingen (optioneel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Voeg opmerkingen toe voor de print operator..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Cost & Info */}
        <div className="space-y-6">
          {/* Cost Estimation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Kostenraming</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Geschatte kosten:</span>
                  <Badge variant="outline">
                    {estimatedCost} credits
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Geschatte tijd:</span>
                  <Badge variant="outline">
                    {Math.floor(estimatedDuration / 60)}h {estimatedDuration % 60}m
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Je credits:</span>
                  <Badge variant={userCredits >= estimatedCost ? 'default' : 'destructive'}>
                    {userCredits} credits
                  </Badge>
                </div>
              </div>

              {estimatedCost > userCredits && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Je hebt niet genoeg credits. Koop meer credits om verder te gaan.
                  </AlertDescription>
                </Alert>
              )}

              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!canSubmit}
                    size="lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Dien Print Aanvraag In
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bevestig Print Aanvraag</DialogTitle>
                    <DialogDescription>
                      Controleer je aanvraag voordat je deze indient.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span>Bestand:</span>
                        <span className="font-medium">{form.file?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Printer:</span>
                        <span className="font-medium">{selectedPrinter?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kosten:</span>
                        <span className="font-medium">{estimatedCost} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Geschatte tijd:</span>
                        <span className="font-medium">
                          {Math.floor(estimatedDuration / 60)}h {estimatedDuration % 60}m
                        </span>
                      </div>
                    </div>
                    {form.notes && (
                      <div>
                        <span className="font-medium">Opmerkingen:</span>
                        <p className="text-sm text-muted-foreground mt-1">{form.notes}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Bezig...' : 'Bevestigen'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Print Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Print Richtlijnen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="requirements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="requirements">Vereisten</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="requirements" className="space-y-2">
                  <ul className="text-sm space-y-1">
                    <li>• Ondersteunde formaten: STL, GCODE</li>
                    <li>• Maximum bestandsgrootte: 50MB</li>
                    <li>• Minimum wanddikte: 0.8mm</li>
                    <li>• Maximum printgrootte: 256 x 256 x 256mm</li>
                  </ul>
                </TabsContent>
                <TabsContent value="tips" className="space-y-2">
                  <ul className="text-sm space-y-1">
                    <li>• Gebruik supports voor overhangende delen</li>
                    <li>• Oriënteer je model voor beste kwaliteit</li>
                    <li>• Controleer je model op fouten</li>
                    <li>• Voeg duidelijke opmerkingen toe</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}