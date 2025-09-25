export interface User {
  id: string;
  email: string;
  name: string;
  studentNumber?: string;
  role: 'student' | 'admin';
  credits: number; // 3D printing credits (toegoed)
  createdAt: Date;
  updatedAt: Date;
}

export interface Printer {
  id: string;
  name: string;
  brand: 'Bambu Lab X1C' | 'Ultimaker';
  status: 'online' | 'offline' | 'printing' | 'maintenance' | 'disabled';
  location?: string;
  description?: string;
  currentJobId?: string;
  estimatedCompletionTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintJob {
  id: string;
  userId: string;
  printerId: string;
  fileName: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'printing' | 'completed' | 'failed' | 'cancelled';
  priority: number; // 1 = highest priority
  creditCost: number;
  estimatedDuration?: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  approvedBy?: string; // admin user ID
}

export interface PrintQueue {
  printerId: string;
  jobs: PrintJob[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive for credits added, negative for credits spent
  type: 'purchase' | 'print_job' | 'refund' | 'admin_adjustment';
  description: string;
  printJobId?: string;
  createdAt: Date;
}

export interface PrinterStats {
  printerId: string;
  totalJobsCompleted: number;
  totalPrintTime: number; // in minutes
  averageJobTime: number; // in minutes
  uptime: number; // percentage
  lastMaintenanceDate?: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface PrintRequestForm {
  file: File | null;
  printerId: string;
  notes?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth types
export interface AuthSession {
  user: User;
  accessToken: string;
  expires: string;
}