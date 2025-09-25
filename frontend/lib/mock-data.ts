import type { Printer, PrintJob, User, CreditTransaction } from '@/lib/types';

export const mockPrinters: Printer[] = [
  {
    id: '1',
    name: 'Bambu Lab X1C #1',
    brand: 'Bambu Lab X1C',
    status: 'printing',
    location: 'Lab A - Werkplaats 1',
    description: 'High-speed 3D printer voor prototyping',
    currentJobId: '1',
    estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Bambu Lab X1C #2',
    brand: 'Bambu Lab X1C',
    status: 'online',
    location: 'Lab A - Werkplaats 1',
    description: 'High-speed 3D printer voor prototyping',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Bambu Lab X1C #3',
    brand: 'Bambu Lab X1C',
    status: 'maintenance',
    location: 'Lab A - Werkplaats 1',
    description: 'High-speed 3D printer - in onderhoud',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Ultimaker #1',
    brand: 'Ultimaker',
    status: 'online',
    location: 'Lab B - Werkplaats 2',
    description: 'Betrouwbare FDM printer voor educatie',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Ultimaker #2',
    brand: 'Ultimaker',
    status: 'printing',
    location: 'Lab B - Werkplaats 2',
    description: 'Betrouwbare FDM printer voor educatie',
    currentJobId: '3',
    estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Ultimaker #3',
    brand: 'Ultimaker',
    status: 'offline',
    location: 'Lab B - Werkplaats 2',
    description: 'Betrouwbare FDM printer - offline',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'jan.student@student.landstede.nl',
    name: 'Jan de Student',
    studentNumber: '12345678',
    role: 'student',
    credits: 45,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'marie.admin@landstede.nl',
    name: 'Marie Beheerder',
    role: 'admin',
    credits: 999,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'piet.student@student.landstede.nl',
    name: 'Piet Printen',
    studentNumber: '87654321',
    role: 'student',
    credits: 25,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date(),
  },
];

export const mockPrintJobs: PrintJob[] = [
  {
    id: '1',
    userId: '1',
    printerId: '1',
    fileName: 'prototype_housing.stl',
    status: 'printing',
    priority: 1,
    creditCost: 15,
    estimatedDuration: 120, // 2 hours
    notes: 'Urgent voor project deadline',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(),
    startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    approvedBy: '2',
  },
  {
    id: '2',
    userId: '1',
    printerId: '2',
    fileName: 'gear_mechanism.stl',
    status: 'pending',
    priority: 2,
    creditCost: 8,
    estimatedDuration: 45,
    notes: 'Test print voor mechanisme',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: '3',
    printerId: '5',
    fileName: 'miniature_model.stl',
    status: 'printing',
    priority: 3,
    creditCost: 12,
    estimatedDuration: 180, // 3 hours
    notes: 'Schaalmodel voor presentatie',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(),
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    approvedBy: '2',
  },
  {
    id: '4',
    userId: '1',
    printerId: '1',
    fileName: 'bracket_v2.stl',
    status: 'completed',
    priority: 1,
    creditCost: 5,
    estimatedDuration: 30,
    notes: 'Verbeterde versie van bracket',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    approvedBy: '2',
  },
  {
    id: '5',
    userId: '3',
    printerId: '4',
    fileName: 'support_structure.stl',
    status: 'failed',
    priority: 2,
    creditCost: 10,
    estimatedDuration: 90,
    notes: 'Print mislukt - materiaal probleem',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    approvedBy: '2',
  },
];

export const mockCreditTransactions: CreditTransaction[] = [
  {
    id: '1',
    userId: '1',
    amount: 50,
    type: 'purchase',
    description: 'Credit aankoop - starterpack',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    userId: '1',
    amount: -5,
    type: 'print_job',
    description: 'Print job: bracket_v2.stl',
    printJobId: '4',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userId: '3',
    amount: 50,
    type: 'purchase',
    description: 'Credit aankoop - starterpack',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    userId: '3',
    amount: 10,
    type: 'refund',
    description: 'Terugbetaling voor mislukte print',
    printJobId: '5',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    userId: '3',
    amount: -10,
    type: 'print_job',
    description: 'Print job: support_structure.stl (mislukt)',
    printJobId: '5',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    userId: '3',
    amount: -25,
    type: 'print_job',
    description: 'Print job: miniature_model.stl',
    printJobId: '3',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

// Helper function to get print queue for a specific printer
export const getPrintQueueForPrinter = (printerId: string) => {
  const jobs = mockPrintJobs.filter(job => 
    job.printerId === printerId && 
    ['pending', 'approved', 'printing'].includes(job.status)
  ).sort((a, b) => a.priority - b.priority);
  
  return {
    printerId,
    jobs,
  };
};

// Helper function to get all print queues
export const getAllPrintQueues = () => {
  return mockPrinters.map(printer => getPrintQueueForPrinter(printer.id));
};