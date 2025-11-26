'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { providers, offers, departments } from '@/lib/data';
import type { Provider } from '@/lib/types';

// Define a more specific type for CommissionFormula
export type CommissionFormula = 'Standard' | 'TOP50' | 'INBORSA' | 'INBORSA TOP';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome dell\'offerta è obbligatorio.'),
  departmentId: z.enum(['energia', 'telefonia', 'noleggio'], { required_error: 'Il reparto è obbligatorio.'}),
  providerId: z.string().min(1, 'Il fornitore è obbligatorio.'),
  formula: z.enum(['Standard', 'TOP50', 'INBORSA', 'INBORSA TOP']),
  description: z.string().optional(),
  active: z.boolean().default(true),

  // Base commission fields
  baseValue: z.coerce.number().optional(),
  agentOneTimePercentage: z.coerce.number().min(0).max(100).optional(),

  // Recurring commission fields
  recurringFactor: z.coerce.number().optional(),
  recurringOneTimeSplit: z.coerce.number().min(0).max(100).optional(),
  recurringMonthlySplit: z.coerce.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Default factors from business logic
const RECURRING_FACTORS: Record<Exclude<CommissionFormula, 'Standard'>, number> = {
  'TOP50': 0.006,
  'INBORSA': 0.065,
  'INBORSA TOP': 0.05,
};

export default function NewOfferPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      departmentId: 'energia',
      providerId: '',
      formula: 'Standard',
      description: '',
      active: true,
      baseValue: 0,
      agentOneTimePercentage: 80,
    },
  });
  
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [availableFormulas, setAvailableFormulas] = useState<CommissionFormula[]>(['Standard']);

  const departmentId = form.watch('departmentId');
  const selectedProviderId = form.watch('providerId');
  const formula = form.watch('formula');
  
  const baseValue = Number(form.watch('baseValue')) || 0;
  const agentPercentage = form.watch('agentOneTimePercentage') || 0;
  const agentCommission = (baseValue * agentPercentage) / 100;
  
  const edisonProvider = providers.find(p => p.name.toLowerCase() === 'edison');

  useEffect(() => {
    if (departmentId) {
      const filteredProviders = providers.filter(p => p.departmentId === departmentId);
      setAvailableProviders(filteredProviders);
      form.setValue('providerId', ''); // Reset provider on department change
    } else {
      setAvailableProviders([]);
    }
  }, [departmentId, form]);

  useEffect(() => {
    if (selectedProviderId === edisonProvider?.id) {
      setAvailableFormulas(['Standard', 'TOP50', 'INBORSA', 'INBORSA TOP']);
    } else {
      setAvailableFormulas(['Standard']);
      if (form.getValues('formula') !== 'Standard') {
        form.setValue('formula', 'Standard');
      }
    }
  }, [selectedProviderId, edisonProvider?.id, form]);

  useEffect(() => {
    if (formula !== 'Standard' && RECURRING_FACTORS[formula]) {
      form.setValue('recurringFactor', RECURRING_FACTORS[formula]);
    }
  }, [formula, form]);

  const onSubmit = (data: FormData) => {
    const newOffer = {
      id: `offer-${Date.now()}`,
      ...data,
    };
    offers.push(newOffer as any); // Use 'as any' to match the less specific Offer type
    
    console.log(JSON.stringify(newOffer, null, 2));
    
    toast({
      title: 'Offerta Creata',
      description: `L'offerta "${data.name}" è stata salvata con successo.`,
    });
    router.push('/settings/offers');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuova Offerta</h1>
          <p className="text-muted-foreground">Compila i dati per creare una nuova offerta commerciale.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings/offers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Link>
          </Button>
          <Button type="submit" form="new-offer-form">
            <Save className="mr-2 h-4 w-4" />
            Salva Offerta
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form id="new-offer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Offerta</CardTitle>
              <CardDescription>Informazioni principali dell'offerta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Offerta *</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Flex Monoraria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Reparto *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona un reparto" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {departments.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornitore *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!departmentId ? "Seleziona prima un reparto" : "Seleziona un fornitore"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableProviders.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="formula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Offerta</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableFormulas.map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormDescription>
                           Disponibile solo per alcuni fornitori.
                        </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrizione</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrizione interna dell'offerta..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Offerta Attiva</FormLabel>
                      <FormDescription>
                        Se disattivata, non sarà selezionabile nei nuovi contratti.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurazione Provvigioni</CardTitle>
              <CardDescription>Definisci il modello di commissione per questa offerta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={formula === 'Standard' ? 'base' : 'recurring'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="base" disabled={formula !== 'Standard'}>Commissione Base</TabsTrigger>
                  <TabsTrigger value="recurring" disabled={formula === 'Standard'}>Commissione Ricorrente</TabsTrigger>
                </TabsList>
                <TabsContent value="base" className="pt-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="baseValue"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Valore Base (€)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Es. 100" {...field} />
                                    </FormControl>
                                    <FormDescription>La provvigione totale per DEM Group.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name="agentOneTimePercentage"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>% Agente (una tantum)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Es. 80" {...field} />
                                    </FormControl>
                                    <FormDescription>La % riconosciuta all'agente.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                        <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                            La commissione base viene calcolata una tantum al momento della creazione del contratto. <br/>
                            Con i valori attuali, l'agente riceverà: <strong>{agentPercentage}%</strong> di <strong>{baseValue.toFixed(2)}€</strong> = <strong>{agentCommission.toFixed(2)}€</strong>.
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="recurring" className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    I calcoli per le commissioni ricorrenti sono gestiti dalla logica pre-impostata nel sistema in base alla formula ('{formula}') e al consumo annuo del cliente. Qui puoi definire i parametri chiave.
                  </p>
                   <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="recurringFactor"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Fattore di Calcolo</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.001" placeholder="Es. 0.065" {...field} />
                                    </FormControl>
                                    <FormDescription>Moltiplicatore per il consumo annuo.</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
