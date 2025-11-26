'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { reports as allReports } from '@/lib/data';
import type { Report } from '@/lib/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgentReportReviewCardProps {
  agentId: string;
}

export function AgentReportReviewCard({ agentId }: AgentReportReviewCardProps) {
  const { toast } = useToast();
  
  // Note: In a real app, this state would be managed globally or fetched from a server.
  // We use a local state derived from a mutable import for demo purposes.
  const [reports, setReports] = useState<Report[]>(allReports);

  const pendingReports = useMemo(() => {
    return reports.filter(r => r.agentId === agentId && r.status === 'Pending');
  }, [reports, agentId]);


  const handleReportAction = (reportId: string, status: 'Approved' | 'Rejected') => {
    // This function mimics a state update that would happen on a server.
    const reportIndex = allReports.findIndex(r => r.id === reportId);
    if (reportIndex > -1) {
        allReports[reportIndex].status = status;
    }
    
    // We update the local state to trigger a re-render.
    setReports([...allReports]);

    toast({
      title: `Report ${status}`,
      description: `Il report è stato contrassegnato come ${status.toLowerCase()}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>I Miei Report da Revisionare</CardTitle>
        <CardDescription>Controlla i report generati dal back-office e approva per il pagamento.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingReports.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {pendingReports.map(report => (
              <AccordionItem value={report.id} key={report.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span>Report del {format(new Date(report.generationDate), 'dd/MM/yyyy')}</span>
                    <Badge variant="outline">
                        {report.contracts.length} Contratti
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Generato da: {report.generatedBy}
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Valore</TableHead>
                            <TableHead>Data Inizio</TableHead>
                            <TableHead>Stato</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.contracts.map(contract => (
                                <TableRow key={contract.id}>
                                    <TableCell>{contract.clientName}</TableCell>
                                    <TableCell>€{contract.value.toLocaleString()}</TableCell>
                                    <TableCell>{format(new Date(contract.startDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge
                                        variant="outline"
                                        className={cn({
                                            'text-green-400 border-green-400/50': contract.status === 'Active',
                                            'text-gray-400 border-gray-400/50': contract.status === 'Expired',
                                            'text-yellow-400 border-yellow-400/50': contract.status === 'Pending',
                                        })}
                                        >
                                        {contract.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="destructive" onClick={() => handleReportAction(report.id, 'Rejected')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Contesta
                        </Button>
                        <Button variant="default" onClick={() => handleReportAction(report.id, 'Approved')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approva
                        </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nessun report in attesa di revisione.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
