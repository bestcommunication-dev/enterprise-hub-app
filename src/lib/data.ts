import type { User, Client, Contract, Commission, Report, Provider, Offer, FileItem } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'info@bestcommunication.it', role: 'Admin' },
  { id: 'user-2', name: 'Back Office User', email: 'backoffice@example.com', role: 'Back-Office' },
  { id: 'user-3', name: 'Agent Smith', email: 'michyamico@gmail.com', role: 'Agent' },
  { id: 'user-4', name: 'Agent Jones', email: 'mt.marcotorregrossa@gmail.com', role: 'Agent' },
];

export const departments = [
    { id: 'energia', name: 'Energia' },
    { id: 'telefonia', name: 'Telefonia' },
    { id: 'noleggio', name: 'Noleggio' },
];

export const clients: Client[] = [
  { id: 'client-1', name: 'daniele milazzo', type: 'Private', department: 'Energia', status: 'Attivo', creationDate: '2023-01-05', agentId: 'user-3', email: 'daniele.milazzo@example.com' },
  { id: 'client-2', name: 'marco torre', type: 'Private', department: 'Energia', status: 'Attivo', creationDate: '2023-02-20', agentId: 'user-4', email: 'marco.torre@example.com' },
  { id: 'client-3', name: 'michele amico', type: 'Private', department: 'Energia', status: 'Attivo', creationDate: '2022-06-15', agentId: 'user-3', email: 'michele.amico@example.com' },
  { id: 'client-4', name: 'Cyberdyne Systems', type: 'Business', department: 'Tecnologia', status: 'Inattivo', creationDate: '2022-05-20', agentId: 'user-4', email: 'sales@cyberdyne.com' },
  { id: 'client-5', name: 'Ollivanders', type: 'Business', department: 'Retail', status: 'Lead', creationDate: '2023-03-10', agentId: 'user-3', email: 'ollivander@wizards.com' },
  { id: 'client-6', name: 'Wayne Enterprises', type: 'Business', department: 'Tecnologia', status: 'Attivo', creationDate: '2023-08-15', agentId: 'user-4', email: 'info@wayne.com' },
  { id: 'client-7', name: 'Acme Corporation', type: 'Business', department: 'Industria', status: 'Attivo', creationDate: '2023-09-01', agentId: 'user-3', email: 'support@acme.com' },
  { id: 'client-8', name: 'Stark Industries', type: 'Business', department: 'Tecnologia', status: 'Attivo', creationDate: '2024-01-10', agentId: 'user-4', email: 'contact@stark.com' },
  { id: 'client-9', name: 'Gekko & Co', type: 'Business', department: 'Finanza', status: 'Lead', creationDate: '2024-02-28', agentId: 'user-3', email: 'gekko@wallst.com' },
];

export let contracts: Contract[] = [
  { id: 'contract-1', clientId: 'client-1', clientName: 'daniele milazzo', startDate: '2023-01-15', endDate: '2025-01-14', status: 'Attivo', value: 50000, department: 'Energia', agentId: 'user-3', agentName: 'Agent Smith', insertionDate: '2023-01-10', contractType: 'Luce', typology: 'Switch' },
  { id: 'contract-2', clientId: 'client-2', clientName: 'marco torre', startDate: '2023-03-01', endDate: '2025-03-01', status: 'Attivo', value: 250000, department: 'Energia', agentId: 'user-4', agentName: 'Agent Jones', insertionDate: '2023-02-25', contractType: 'Gas', typology: 'Subentro' },
  { id: 'contract-3', clientId: 'client-3', clientName: 'michele amico', startDate: '2022-06-20', endDate: '2023-06-19', status: 'Completato', value: 120000, department: 'Energia', agentId: 'user-3', agentName: 'Agent Smith', insertionDate: '2022-06-15', contractType: 'Luce', typology: 'Voltura' },
  { id: 'contract-4', clientId: 'client-1', clientName: 'daniele milazzo', startDate: '2024-02-01', endDate: '2025-02-01', status: 'In attesa', value: 15000, department: 'Telefonia', agentId: 'user-3', agentName: 'Agent Smith', insertionDate: '2024-01-28', contractType: 'Mobile' },
  { id: 'contract-5', clientId: 'client-5', clientName: 'Ollivanders', startDate: '2023-09-01', endDate: '2028-09-01', status: 'Attivo', value: 75000, department: 'Noleggio', agentId: 'user-3', agentName: 'Agent Smith', insertionDate: '2023-08-25', contractType: 'Auto' },
  { id: 'contract-6', clientId: 'client-6', clientName: 'Wayne Enterprises', startDate: '2023-08-20', endDate: '2025-08-20', status: 'Attivo', value: 1200000, department: 'Noleggio', agentId: 'user-4', agentName: 'Agent Jones', insertionDate: '2023-08-15', contractType: 'Auto' },
  { id: 'contract-7', clientId: 'client-7', clientName: 'Acme Corporation', startDate: '2023-09-10', endDate: '2024-09-09', status: 'Attivo', value: 85000, department: 'Energia', agentId: 'user-3', agentName: 'Agent Smith', insertionDate: '2023-09-05', contractType: 'Luce', typology: 'Switch' },
  { id: 'contract-8', clientId: 'client-8', clientName: 'Stark Industries', startDate: '2024-01-15', endDate: '2026-01-15', status: 'Attivo', value: 2500000, department: 'Noleggio', agentId: 'user-4', agentName: 'Agent Jones', insertionDate: '2024-01-10', contractType: 'Apple' },
  { id: 'contract-9', clientId: 'client-4', clientName: 'Cyberdyne Systems', startDate: '2022-07-01', endDate: '2023-07-01', status: 'Completato', value: 95000, department: 'Telefonia', agentId: 'user-4', agentName: 'Agent Jones', insertionDate: '2022-06-28', contractType: 'Fisso + Mobile' },
];

export const commissions: Commission[] = [
  { id: 'comm-1', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-1', clientName: 'daniele milazzo', amount: 2500, date: '2023-02-01', status: 'Paid' },
  { id: 'comm-2', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-2', clientName: 'marco torre', amount: 12500, date: '2023-03-15', status: 'Paid' },
  { id: 'comm-3', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-3', clientName: 'michele amico', amount: 6000, date: '2022-07-01', status: 'Paid' },
  { id: 'comm-4', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-2', clientName: 'marco torre', amount: 5000, date: '2024-01-10', status: 'Unpaid' },
  { id: 'comm-5', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-5', clientName: 'Ollivanders', amount: 3750, date: '2023-09-20', status: 'Flagged' },
  { id: 'comm-6', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-5', clientName: 'Ollivanders', amount: 3750, date: '2023-10-20', status: 'Unpaid' },
  { id: 'comm-7', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-6', clientName: 'Wayne Enterprises', amount: 60000, date: '2023-09-01', status: 'Paid' },
  { id: 'comm-8', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-7', clientName: 'Acme Corporation', amount: 4250, date: '2023-09-15', status: 'Paid' },
  { id: 'comm-9', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-8', clientName: 'Stark Industries', amount: 125000, date: '2024-02-01', status: 'Unpaid' },
  { id: 'comm-10', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-9', clientName: 'Cyberdyne Systems', amount: 4750, date: '2022-07-15', status: 'Paid' },
  { id: 'comm-11', agentId: 'user-3', agentName: 'Agent Smith', contractId: 'contract-1', clientName: 'daniele milazzo', amount: 2500, date: '2024-02-01', status: 'Unpaid' },
  { id: 'comm-12', agentId: 'user-4', agentName: 'Agent Jones', contractId: 'contract-6', clientName: 'Wayne Enterprises', amount: 20000, date: '2024-03-01', status: 'Unpaid' },
];


// Using 'let' to allow in-memory modification for demo purposes.
export let reports: Report[] = [];

export let providers: Provider[] = [
    { id: 'edison', name: 'Edison', departmentId: 'energia' },
    { id: 'enel', name: 'Enel Energia', departmentId: 'energia' },
    { id: 'eni', name: 'Eni Plenitude', departmentId: 'energia' },
    { id: 'sorgenia', name: 'Sorgenia', departmentId: 'energia' },
    { id: 'tim', name: 'TIM', departmentId: 'telefonia' },
    { id: 'vodafone', name: 'Vodafone', departmentId: 'telefonia' },
    { id: 'wind', name: 'WindTre', departmentId: 'telefonia' },
    { id: 'leaseplan', name: 'LeasePlan', departmentId: 'noleggio' },
    { id: 'ald', name: 'ALD Automotive', departmentId: 'noleggio' },
];

export let offers: Offer[] = [
  // Energia
  { id: 'edison-top50', name: 'TOP50', providerId: 'edison', departmentId: 'energia', formula: 'TOP50', active: true },
  { id: 'edison-inborsa', name: 'INBORSA', providerId: 'edison', departmentId: 'energia', formula: 'INBORSA', active: true },
  { id: 'enel-flex', name: 'Flex', providerId: 'enel', departmentId: 'energia', formula: 'Standard', active: true },
  { id: 'enel-sempre-con-te', name: 'Sempre con te', providerId: 'enel', departmentId: 'energia', formula: 'Standard', active: true },
  { id: 'eni-link', name: 'Link', providerId: 'eni', departmentId: 'energia', formula: 'Standard', active: true },
  { id: 'eni-trend-casa', name: 'Trend Casa', providerId: 'eni', departmentId: 'energia', formula: 'Standard', active: true },
  { id: 'sorgenia-next-energy', name: 'Next Energy Sunlight', providerId: 'sorgenia', departmentId: 'energia', formula: 'Standard', active: true },
  // Telefonia
  { id: 'tim-fibra', name: 'TIM Fibra', providerId: 'tim', departmentId: 'telefonia', formula: 'Standard', active: true },
  { id: 'vodafone-giga', name: 'Vodafone Giga Family', providerId: 'vodafone', departmentId: 'telefonia', formula: 'Standard', active: true },
  // Noleggio
  { id: 'leaseplan-suv', name: 'Noleggio SUV', providerId: 'leaseplan', departmentId: 'noleggio', formula: 'Standard', active: true },
];

export const fileArchive: FileItem[] = [
  { id: 'folder-1', name: 'Contratti', type: 'folder', modifiedAt: '2024-05-10', parentId: null },
  { id: 'folder-2', name: 'Documenti Agenti', type: 'folder', modifiedAt: '2024-05-10', parentId: null },
  { id: 'folder-3', name: 'Marketing', type: 'folder', modifiedAt: '2024-05-12', parentId: null },
  { id: 'file-1', name: 'contratto_milazzo.pdf', type: 'file', size: '1.2 MB', modifiedAt: '2024-05-10', parentId: 'folder-1', url: '#' },
  { id: 'file-2', name: 'contratto_torre.pdf', type: 'file', size: '2.5 MB', modifiedAt: '2024-05-11', parentId: 'folder-1', url: '#' },
  { id: 'folder-4', name: 'Report Mensili', type: 'folder', modifiedAt: '2024-05-11', parentId: 'folder-1' },
  { id: 'file-3', name: 'report_maggio_2024.xlsx', type: 'file', size: '500 KB', modifiedAt: '2024-06-01', parentId: 'folder-4', url: '#' },
  { id: 'file-4', name: 'documento_identita_smith.pdf', type: 'file', size: '800 KB', modifiedAt: '2024-01-15', parentId: 'folder-2', url: '#' },
  { id: 'file-5', name: 'brochure_nuova_offerta.png', type: 'file', size: '4.1 MB', modifiedAt: '2024-05-20', parentId: 'folder-3', url: '#' },
  { id: 'file-6', name: 'presentazione_aziendale.pptx', type: 'file', size: '15.3 MB', modifiedAt: '2024-04-28', parentId: null, url: '#' }
];


/**
 * @deprecated Use `providers` and `offers` instead.
 */
export const energyProviders = providers.filter(p => p.departmentId === 'energia');
/**
 * @deprecated Use `providers` and `offers` instead.
 */
export const energyOffers = offers.filter(o => o.departmentId === 'energia');

export const energyOffersByProvider: { [key: string]: { id: string; name: string }[] } = offers.reduce((acc, offer) => {
  if (offer.departmentId === 'energia') {
    if (!acc[offer.providerId]) {
      acc[offer.providerId] = [];
    }
    acc[offer.providerId].push({ id: offer.id, name: offer.name });
  }
  return acc;
}, {} as { [key: string]: { id: string; name: string }[] });
