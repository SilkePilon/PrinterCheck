import { create } from 'zustand';
import type { Printer, PrintJob, PrintQueue, User, CreditTransaction } from '@/lib/types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Printers state
  printers: Printer[];
  setPrinters: (printers: Printer[]) => void;
  addPrinter: (printer: Printer) => void;
  updatePrinter: (id: string, updates: Partial<Printer>) => void;
  deletePrinter: (id: string) => void;
  
  // Print jobs state
  printJobs: PrintJob[];
  setPrintJobs: (jobs: PrintJob[]) => void;
  addPrintJob: (job: PrintJob) => void;
  updatePrintJob: (id: string, updates: Partial<PrintJob>) => void;
  deletePrintJob: (id: string) => void;
  
  // Print queues state
  printQueues: PrintQueue[];
  setPrintQueues: (queues: PrintQueue[]) => void;
  
  // Credit transactions state
  creditTransactions: CreditTransaction[];
  setCreditTransactions: (transactions: CreditTransaction[]) => void;
  addCreditTransaction: (transaction: CreditTransaction) => void;
  
  // UI state
  selectedPrinter: string | null;
  setSelectedPrinter: (printerId: string | null) => void;
  
  // Loading states
  loading: {
    printers: boolean;
    printJobs: boolean;
    user: boolean;
  };
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Printers state
  printers: [],
  setPrinters: (printers) => set({ printers }),
  addPrinter: (printer) => set((state) => ({ 
    printers: [...state.printers, printer] 
  })),
  updatePrinter: (id, updates) => set((state) => ({
    printers: state.printers.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePrinter: (id) => set((state) => ({
    printers: state.printers.filter(p => p.id !== id)
  })),
  
  // Print jobs state
  printJobs: [],
  setPrintJobs: (printJobs) => set({ printJobs }),
  addPrintJob: (job) => set((state) => ({ 
    printJobs: [...state.printJobs, job] 
  })),
  updatePrintJob: (id, updates) => set((state) => ({
    printJobs: state.printJobs.map(j => j.id === id ? { ...j, ...updates } : j)
  })),
  deletePrintJob: (id) => set((state) => ({
    printJobs: state.printJobs.filter(j => j.id !== id)
  })),
  
  // Print queues state
  printQueues: [],
  setPrintQueues: (printQueues) => set({ printQueues }),
  
  // Credit transactions state
  creditTransactions: [],
  setCreditTransactions: (creditTransactions) => set({ creditTransactions }),
  addCreditTransaction: (transaction) => set((state) => ({
    creditTransactions: [...state.creditTransactions, transaction]
  })),
  
  // UI state
  selectedPrinter: null,
  setSelectedPrinter: (selectedPrinter) => set({ selectedPrinter }),
  
  // Loading states
  loading: {
    printers: false,
    printJobs: false,
    user: false,
  },
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
}));