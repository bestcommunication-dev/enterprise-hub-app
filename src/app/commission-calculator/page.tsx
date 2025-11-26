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
import { providers, departments, users } from '@/lib/data';
import { useUser } from '@/firebase';
import { MoreHorizontal, PlusCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ProvidersSettingsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;
  
  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }

  const canEdit = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';

  const handleAction = (action: string, providerName: string) => {
    toast({
      title: `Azione: ${action}`,
      description: `Fornitore: ${providerName}`,
    });
  };
  
  const getDepartmentName = (departmentId: string) => {
      return departments.find(d => d.id === departmentId)?.name || 'N/D';
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Gestione Fornitori
          </h1>
          <p className="text-muted-foreground">Crea, visualizza e gestisci i fornitori di servizi.</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/settings/providers/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Fornitore
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Fornitori</CardTitle>
          <CardDescription>Visualizza e gestisci tutti i fornitori per reparto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Fornitore</TableHead>
                <TableHead>Reparto</TableHead>
                {canEdit && <TableHead className="text-right">Azioni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>
                      <Badge variant="secondary">{getDepartmentName(provider.departmentId)}</Badge>
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
                          <DropdownMenuItem onClick={() => handleAction('Modifica', provider.name)}>Modifica</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Elimina', provider.name)} className="text-red-500">
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
      </Card>
    </div>
  );
}
