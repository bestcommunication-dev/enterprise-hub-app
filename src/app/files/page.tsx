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
import { fileArchive, users } from '@/lib/data';
import { useUser } from '@/firebase';
import { MoreHorizontal, PlusCircle, Folder, File, Upload, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useState } from 'react';

export default function FilesPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }

  const canEdit = mockUser?.role === 'Admin' || mockUser?.role === 'Back-Office';

  const handleAction = (action: string, itemName: string) => {
    toast({
      title: `Azione: ${action}`,
      description: `Elemento: ${itemName}`,
    });
  };

  const currentItems = fileArchive.filter(item => item.parentId === currentFolderId);
  const currentFolder = currentFolderId ? fileArchive.find(item => item.id === currentFolderId) : null;

  const buildBreadcrumbs = () => {
    let breadcrumbs = [];
    let folder = currentFolder;
    while(folder) {
        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        folder = folder.parentId ? fileArchive.find(item => item.id === folder.parentId) : null;
    }
    return breadcrumbs;
  }
  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3">
            <Archive className="h-8 w-8" />
            Archivio Documenti
          </h1>
          <p className="text-muted-foreground">Naviga e gestisci i file e le cartelle.</p>
        </div>
        {canEdit && (
            <div className="flex gap-2">
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Carica File
                </Button>
                <Button variant="secondary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuova Cartella
                </Button>
          </div>
        )}
      </div>

       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
                <button onClick={() => setCurrentFolderId(null)} className="font-medium">Archivio</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                   <span className="text-foreground">{crumb.name}</span>
                ) : (
                    <BreadcrumbLink asChild>
                        <button onClick={() => setCurrentFolderId(crumb.id)}>{crumb.name}</button>
                    </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Contenuto di: {currentFolder?.name || 'Archivio'}</CardTitle>
          <CardDescription>Visualizza file e cartelle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Ultima Modifica</TableHead>
                <TableHead className="hidden md:table-cell">Dimensione</TableHead>
                {canEdit && <TableHead className="text-right">Azioni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <button 
                        className="flex items-center gap-2 hover:underline disabled:no-underline disabled:cursor-text"
                        onClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}
                        disabled={item.type !== 'folder'}
                    >
                      {item.type === 'folder' ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                      {item.name}
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(item.modifiedAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.size || '–'}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleAction('Download', item.name)}>Download</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAction('Rinomina', item.name)}>Rinomina</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Sposta', item.name)}>Sposta</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Elimina', item.name)} className="text-red-500">
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
               {currentItems.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Questa cartella è vuota.
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
