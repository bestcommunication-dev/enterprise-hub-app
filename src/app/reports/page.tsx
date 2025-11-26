'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Send, BarChartHorizontal } from 'lucide-react';
import { users, contracts as allContracts, departments, reports } from '@/lib/data';
import { useUser } from '@/firebase';
import type { Report } from '@/lib/types';

const availableAgents = users.filter(u => u.role === 'Agent');

export default function ReportsPage() {
  const { toast } = useToast();
  const [department, setDepartment] = useState<string>('all');
  const [agentId, setAgentId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { user, isUserLoading } = useUser();
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  useEffect(() => {
    if (mockUser?.role === 'Agent') {
      setAgentId(mockUser.id);
    }
  }, [mockUser]);

  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }

  const canSendReport = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';


  const filteredContracts = useMemo(() => {
    return allContracts.filter(contract => {
      const contractDate = new Date(contract.startDate);
      const isDepartmentMatch = department === 'all' || contract.department.toLowerCase() === department;
      const isAgentMatch = agentId === 'all' || contract.agentId === agentId;
      const isDateMatch = !dateRange?.from || 
        (dateRange.from && !dateRange.to && contractDate >= dateRange.from) ||
        (dateRange.from && dateRange.to && isWithinInterval(contractDate, { start: dateRange.from, end: dateRange.to }));

      return isDepartmentMatch && isAgentMatch && isDateMatch;
    });
  }, [department, agentId, dateRange]);

  const handleSendReport = () => {
    if (!agentId || agentId === 'all') {
      toast({
        variant: 'destructive',
        title: 'Agente non selezionato',
        description: 'Per favore, seleziona un agente prima di inviare il report.',
      });
      return;
    }

    if (filteredContracts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nessun Contratto da Inviare',
        description: 'Nessun contratto corrisponde ai filtri selezionati.',
      });
      return;
    }
    
    // In a real app, this would be a server action creating a DB record.
    // Here we just push to an in-memory array for demonstration.
    const newReport: Report = {
      id: `report-${Date.now()}`,
      agentId: agentId,
      generatedBy: mockUser?.name || 'Sistema',
      generationDate: new Date().toISOString(),
      contracts: filteredContracts,
      status: 'Pending',
    };
    reports.push(newReport);
    
    toast({
      title: 'Report Inviato',
      description: `Il report con ${filteredContracts.length} contratti è stato inviato all'agente per la revisione.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChartHorizontal className="h-8 w-8" />
            Reportistica Contratti
          </h1>
          <p className="text-muted-foreground">Filtra, visualizza e invia report sui contratti degli agenti.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtri Report</CardTitle>
          <CardDescription>Seleziona i criteri per generare il report dei contratti.</CardDescription>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Reparto Aziendale</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i reparti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i reparti</SelectItem>
                  {departments.map(dep => (
                    <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Agente</label>
              <Select value={agentId} onValueChange={setAgentId} disabled={mockUser?.role === 'Agent'}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli agenti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli agenti</SelectItem>
                  {availableAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Periodo di Riferimento</label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Seleziona un periodo</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {canSendReport && (
              <Button onClick={handleSendReport} disabled={agentId === 'all'}>
                  <Send className="mr-2 h-4 w-4" />
                  Invia Report all'Agente
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead className="hidden md:table-cell">Data Inizio</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.clientName}</TableCell>
                    <TableCell>€{contract.value.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn({
                          'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20': contract.status === 'Attivo',
                          'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20': contract.status === 'Annullato' || contract.status === 'Completato',
                          'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20': contract.status === 'In attesa',
                        })}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nessun contratto trovato. Prova a modificare i filtri.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
