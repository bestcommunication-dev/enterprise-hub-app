'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { commissions, users } from '@/lib/data';
import { useUser } from '@/firebase';
import { MoreHorizontal, FileDown, Filter, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function CommissionsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;
  
  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }

  const canEdit = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';

  const userCommissions = mockUser.role === 'Agent' 
    ? commissions.filter(c => c.agentId === mockUser.id)
    : commissions;

  const handleAction = (action: string, commissionId: string) => {
    toast({
      title: `Azione: ${action}`,
      description: `Provvigione ID: ${commissionId}`,
    });
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            Gestione Provvigioni
          </h1>
          <p className="text-muted-foreground">Visualizza, approva e gestisci le provvigioni.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Provvigioni</CardTitle>
          <CardDescription>Cerca e filtra le provvigioni per agente, stato o periodo.</CardDescription>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
                <div className="relative w-full md:w-auto md:flex-grow">
                    <Input placeholder="Cerca per agente, cliente..." className="pl-9" />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtra
                    </Button>
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Esporta
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                {mockUser.role !== 'Agent' && <TableHead>Agente</TableHead>}
                <TableHead>Cliente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                {canEdit && <TableHead className="text-right">Azioni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{format(new Date(commission.date), 'dd/MM/yyyy')}</TableCell>
                  {mockUser.role !== 'Agent' && <TableCell>{commission.agentName}</TableCell>}
                  <TableCell>{commission.clientName}</TableCell>
                   <TableCell>€{commission.amount.toLocaleString()}</TableCell>
                   <TableCell>
                      <Badge
                        className={cn({
                          'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20': commission.status === 'Paid',
                          'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20': commission.status === 'Unpaid',
                          'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20': commission.status === 'Flagged',
                        })}
                       >
                        {commission.status === 'Paid' ? 'Pagata' : commission.status === 'Unpaid' ? 'Da Pagare' : 'Contestata'}
                      </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Apri menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction('Approva', commission.id)}>Approva Pagamento</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Contesta', commission.id)} className="text-red-500">
                            Contesta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
