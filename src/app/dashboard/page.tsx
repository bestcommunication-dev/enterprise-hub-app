'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { clients, contracts, commissions, users } from '@/lib/data';
import { DollarSign, FileText, Users, Activity } from 'lucide-react';
import { AgentReportReviewCard } from '@/components/agent-report-review-card';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  if (isUserLoading || !user || !mockUser) {
      return <div>Loading...</div>
  }

  const totalClients = clients.length;
  const activeContracts = contracts.filter(c => c.status === 'Active').length;
  const totalCommissionValue = commissions.reduce((sum, c) => sum + c.amount, 0);
  const myCommissions = commissions.filter(c => c.agentId === mockUser?.id);
  const myTotalCommissionValue = myCommissions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Benvenuto, {mockUser.name}!</h1>
        <p className="text-muted-foreground">Ecco una panoramica della tua attività.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockUser?.role !== 'Agent' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratti Attivi</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeContracts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valore Provvigioni</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{totalCommissionValue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attività Recente</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+20.1% dall'ultimo mese</p>
                </CardContent>
            </Card>
          </>
        )}
        {mockUser?.role === 'Agent' && (
           <>
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mie Provvigioni Totali</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{myTotalCommissionValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{myCommissions.length} pagamenti di provvigioni in totale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratti Attivi</CardTitle>
                 <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contracts.filter(c => c.agentId === mockUser.id && c.status === 'Active').length}</div>
                 <p className="text-xs text-muted-foreground">I tuoi contratti attivi</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuovi Clienti</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{clients.filter(c => c.agentId === mockUser.id).length}</div>
                <p className="text-xs text-muted-foreground">Clienti acquisiti</p>
              </CardContent>
            </Card>
           </>
        )}
      </div>

       {mockUser?.role === 'Agent' && mockUser.id && (
         <div className="mt-6">
          <AgentReportReviewCard agentId={mockUser.id} />
         </div>
      )}

      {mockUser?.role !== 'Agent' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                  <CardTitle>Panoramica Provvigioni</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                  {/* Chart would go here */}
                   <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Grafico in costruzione...
                  </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                  <CardTitle>Contratti Recenti</CardTitle>
                   <CardDescription>Gli ultimi contratti aggiunti al sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                  {contracts.slice(0, 5).map(contract => (
                      <div key={contract.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{contract.clientName}</p>
                            <p className="text-sm text-muted-foreground">{contract.department}</p>
                        </div>
                        <div className="ml-auto font-medium">€{contract.value.toLocaleString()}</div>
                      </div>
                  ))}
                  </div>
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
