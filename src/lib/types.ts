export type Role = 'Admin' | 'Back-Office' | 'Agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  type: 'Private' | 'Business';
  department: string;
  status: 'Attivo' | 'Inattivo' | 'Lead';
  creationDate: string;
  agentId: string;
  email: string;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName?: string; // Denormalized for easy display
  agentId: string;
  agentName?: string; // Denormalized
  department: 'Energia' | 'Telefonia' | 'Noleggio';
  startDate: string;
  endDate: string;
  status: 'In attesa' | 'Attivo' | 'Completato' | 'Annullato';
  value: number;
  contractType?: string;
  typology?: string;
  insertionDate: string;
}

export interface Commission {
  id: string;
  agentId: string;
  agentName?: string; // Denormalized
  contractId: string;
  clientName?: string; // Denormalized
  amount: number;
  date: string;
  status: 'Paid' | 'Unpaid' | 'Flagged';
}

export interface Report {
  id: string;
  agentId: string;
  generatedBy: string;
  generationDate: string;
  contracts: Contract[];
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Provider {
    id: string;
    name: string;
    departmentId: 'energia' | 'telefonia' | 'noleggio';
}

export interface Offer {
    id: string;
    name: string;
    providerId: string;
    departmentId: 'energia' | 'telefonia' | 'noleggio';
    formula: 'Standard' | 'TOP50' | 'INBORSA' | 'INBORSA TOP';
    active: boolean;
    description?: string;
    baseValue?: number;
    agentOneTimePercentage?: number;
    recurringFactor?: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  url?: string;
}
