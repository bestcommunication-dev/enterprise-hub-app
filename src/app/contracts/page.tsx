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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { contracts, users } from '@/lib/data';
import { useUser } from '@/firebase';
import { MoreHorizontal, PlusCircle, Search, FileDown, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ContractsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }
  
  const canEdit = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';

  const userContracts = mockUser.role === 'Agent' 
    ? contracts.filter(c => c.agentId === mockUser.id)
    : contracts;

  const handleAction = (action: string, clientName: string) => {
    toast({
      title: `Azione: ${action}`,
      description: `Contratto per: ${clientName}`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
              <Briefcase className="h-8 w-8" />
              Contratti
          </h1>
          <p className="text-muted-foreground">Gestisci i contratti dei tuoi clienti</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/contracts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo Contratto
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Contratti</CardTitle>
          <CardDescription>Visualizza, cerca e gestisci tutti i contratti.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
            <div className="relative w-full md:w-auto md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca per cliente, reparto..." className="pl-9" />
            </div>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Esporta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">ID Contratto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Reparto</TableHead>
                  <TableHead>Tipo Contratto</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Data Inserimento</TableHead>
                  <TableHead>Stato</TableHead>
                  {canEdit && <TableHead className="text-right">Azioni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {userContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-xs">{contract.id}</TableCell>
                    <TableCell className="font-medium">{contract.clientName}</TableCell>
                    <TableCell>{contract.agentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{contract.department}</Badge>
                    </TableCell>
                    <TableCell>{contract.contractType || '–'}</TableCell>
                    <TableCell>{contract.typology || '–'}</TableCell>
                    <TableCell>{format(new Date(contract.insertionDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn({
                          'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20': contract.status === 'Attivo',
                          'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/20': contract.status === 'Completato',
                          'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20': contract.status === 'Annullato',
                          'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20': contract.status === 'In attesa',
                        })}
                      >
                        {contract.status}
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
                            <DropdownMenuItem onClick={() => handleAction('Visualizza', contract.clientName || 'N/D')}>Visualizza</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Modifica', contract.clientName || 'N/D')}>Modifica</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Elimina', contract.clientName || 'N/D')} className="text-red-500">
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">Mostrando {userContracts.length} di {userContracts.length} contratti</p>
        </CardFooter>
      </Card>
    </div>
  );
}
