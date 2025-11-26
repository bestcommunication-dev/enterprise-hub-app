'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { users } from '@/lib/data';
import { AgentReportReviewCard } from '@/components/agent-report-review-card';
import { TestTube2 } from 'lucide-react';

const availableAgents = users.filter(u => u.role === 'Agent');

export default function AgentSimulatorPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(availableAgents[0]?.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TestTube2 className="h-8 w-8" />
            Simulatore Dashboard Agente
          </h1>
          <p className="text-muted-foreground">
            Seleziona un agente per visualizzare la sua dashboard e testare il flusso di approvazione dei report.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seleziona Agente da Simulare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="agent-selector">Agente</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger id="agent-selector">
                    <SelectValue placeholder="Seleziona un agente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedAgentId ? (
            <div>
                <h2 className="text-2xl font-semibold mb-4">Dashboard di {users.find(u => u.id === selectedAgentId)?.name}</h2>
                <AgentReportReviewCard agentId={selectedAgentId} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                <p className="text-muted-foreground">
                    Seleziona un agente per iniziare la simulazione.
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
