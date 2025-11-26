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
import { clients as allClients, users } from '@/lib/data';
import { useUser } from '@/firebase';
import { MoreHorizontal, PlusCircle, Search, FileDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ClientsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }
  
  const canEdit = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';

  const clients = mockUser?.role === 'Agent' 
    ? allClients.filter(client => client.agentId === mockUser.id)
    : allClients;

  const handleAction = (action: string, clientName: string) => {
    toast({
      title: `Azione: ${action}`,
      description: `Cliente: ${clientName}`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clienti</h1>
          <p className="text-muted-foreground">Gestisci i tuoi clienti e visualizza le loro informazioni</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/clients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Clienti</CardTitle>
          <CardDescription>Visualizza e gestisci tutti i tuoi clienti</CardDescription>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
            <div className="relative w-full md:w-auto md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca clienti..." className="pl-9" />
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
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Dipartimento</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="hidden lg:table-cell">Data Creazione</TableHead>
                {canEdit && <TableHead className="text-right">Azioni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={client.type === 'Private' ? 'secondary' : 'default'}
                      className={cn({
                        'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/20': client.type === 'Private',
                        'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/20': client.type === 'Business',
                      })}
                    >
                      {client.type === 'Private' ? 'privato' : 'business'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                     <Badge variant="outline" className="text-green-700 dark:text-green-400 bg-green-500/20 border-green-500/20">{client.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn({
                        'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20': client.status === 'Attivo',
                        'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20': client.status === 'Inattivo',
                        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20': client.status === 'Lead',
                      })}
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{format(new Date(client.creationDate), 'dd/MM/yyyy')}</TableCell>
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
                           <DropdownMenuItem onClick={() => handleAction('Visualizza', client.name)}>Visualizza</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Modifica', client.name)}>Modifica</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Nuovo Contratto', client.name)}>Nuovo Contratto</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Elimina', client.name)} className="text-red-500">
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
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">Mostrando {clients.length} di {clients.length} clienti</p>
        </CardFooter>
      </Card>
    </div>
  );
}
