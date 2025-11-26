'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, CalendarIcon, Upload, Bot, X, File as FileIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, formatISO, parse } from 'date-fns';
import { users, clients, providers, offers, departments, contracts } from '@/lib/data';
import { Provider, Offer, Contract } from '@/lib/types';
import Image from 'next/image';
import { extractContractData } from '@/ai/flows/contract-parser';
import { sendNotificationFlow } from '@/ai/flows/send-notification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const contractSchema = z.object({
  department: z.enum(['Energia', 'Telefonia', 'Noleggio']),
  clientId: z.string().min(1, "Il cliente è obbligatorio."),
  agentId: z.string().min(1, "L'agente è obbligatorio."),
  contractType: z.string().optional(),
  typology: z.string().optional(),
  signatureDate: z.date({ required_error: 'La data di firma è obbligatoria.' }),
  insertionDate: z.date({ required_error: 'La data di inserimento è obbligatoria.' }),
  status: z.enum(['In attesa', 'Attivo', 'Completato', 'Annullato']).default('In attesa'),
  notes: z.string().optional(),
  // Dynamic fields
  providerId: z.string().optional(),
  offerId: z.string().optional(),
  pdrPod: z.string().optional(),
  annualConsumption: z.string().optional(),
  activationDate: z.date().optional(),
  contractDuration: z.string().optional(),
}).refine(data => {
    if (data.department === 'Energia') {
        return !!data.contractType && data.contractType.length > 0;
    }
    return true;
}, {
    message: "Il tipo di contratto è obbligatorio per il reparto Energia.",
    path: ["contractType"],
});

const energyContractTypes = [
    { id: 'luce', name: 'Luce' },
    { id: 'gas', name: 'Gas' },
];

const phoneContractTypes = [
    { id: 'fisso', name: 'Fisso' },
    { id: 'mobile', name: 'Mobile' },
    { id: 'fisso-mobile', name: 'Fisso + Mobile' },
    { id: 'sme', name: 'SME' },
];

const rentalContractTypes = [
    { id: 'auto', name: 'Auto' },
    { id: 'apple', name: 'Apple' },
];


const defaultTypologies = [
    { id: 'prima-attivazione', name: 'Prima attivazione' },
    { id: 'subentro', name: 'Subentro' },
    { id: 'switch', name: 'Switch' },
    { id: 'switch-voltura', name: 'Switch + Voltura' },
    { id: 'voltura', name: 'Voltura' },
    { id: 'aumento-potenza', name: 'Aumento potenza' },
];

interface FileWithPreview extends File {
    preview: string;
}

export default function NewContractPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  
  const availableAgents = users.filter(u => u.role === 'Agent');

  const form = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      department: 'Energia',
      clientId: '',
      agentId: '',
      contractType: '',
      typology: '',
      status: 'In attesa',
      insertionDate: new Date(),
      notes: '',
      providerId: '',
      offerId: '',
      pdrPod: '',
      annualConsumption: '',
      contractDuration: '',
    },
  });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'], 'application/pdf': ['.pdf'] }
  });
  
  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };
  
  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleAiParsing = async () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nessun file selezionato',
        description: 'Per favore, carica almeno un documento del contratto.',
      });
      return;
    }
    
    setIsParsing(true);
    toast({ title: 'Analisi in corso...', description: 'L\'IA sta analizzando i documenti.' });
    
    try {
      const fileDataUris = await Promise.all(files.map(fileToDataURI));
      
      const result = await extractContractData({ documents: fileDataUris });
      
      const formValues: Partial<z.infer<typeof contractSchema>> = {};

      const client = clients.find(c => c.name.toLowerCase() === result.clientName?.toLowerCase());
      if (client) formValues.clientId = client.id;

      const agent = users.find(u => u.name.toLowerCase() === result.agentName?.toLowerCase());
      if (agent) formValues.agentId = agent.id;

      if (result.department && ['Energia', 'Telefonia', 'Noleggio'].includes(result.department)) {
        formValues.department = result.department as 'Energia' | 'Telefonia' | 'Noleggio';
      }

      if (result.contractType) formValues.contractType = result.contractType;
      
      try {
        if (result.signatureDate) {
          const parsedDate = parse(result.signatureDate, 'dd/MM/yyyy', new Date());
          if (!isNaN(parsedDate.getTime())) {
            formValues.signatureDate = parsedDate;
          }
        }
      } catch (e) { console.error("Could not parse date", e)}


      if (result.pdrPod) formValues.pdrPod = result.pdrPod;
      if (result.annualConsumption) formValues.annualConsumption = result.annualConsumption.toString();

      form.reset({ ...form.getValues(), ...formValues });

      toast({
        title: 'Analisi Completata',
        description: 'Il modulo è stato pre-compilato con i dati estratti.',
      });

    } catch (error) {
      console.error("AI parsing failed:", error);
      toast({
        variant: 'destructive',
        title: 'Analisi Fallita',
        description: 'Non è stato possibile analizzare i documenti. Riprova.',
      });
    } finally {
      setIsParsing(false);
    }
  };


  const department = form.watch('department');
  const departmentId = departments.find(d => d.name === department)?.id;
  const selectedProviderId = form.watch('providerId');
  
  useEffect(() => {
    if (departmentId) {
      setAvailableProviders(providers.filter(p => p.departmentId === departmentId));
    } else {
      setAvailableProviders([]);
    }
    form.setValue('providerId', '');
    form.setValue('offerId', '');
  }, [departmentId, form]);

  useEffect(() => {
    if (selectedProviderId) {
        setAvailableOffers(offers.filter(o => o.providerId === selectedProviderId));
    } else {
        setAvailableOffers([]);
    }
    form.setValue('offerId', '');
  }, [selectedProviderId, form]);


  const contractTypes = department === 'Energia' 
    ? energyContractTypes 
    : department === 'Telefonia' 
    ? phoneContractTypes
    : department === 'Noleggio'
    ? rentalContractTypes
    : [];

  const onSubmit = async (data: z.infer<typeof contractSchema>) => {
    // Generate a simple, sequential ID
    const nextIdNumber = contracts.length + 1;
    const paddedId = String(nextIdNumber).padStart(4, '0');
    const newContractId = `contract-${paddedId}`;

    const clientName = clients.find(c => c.id === data.clientId)?.name;
    const agentName = users.find(u => u.id === data.agentId)?.name;

    const newContract: Contract = {
        id: newContractId,
        clientId: data.clientId,
        clientName: clientName,
        agentId: data.agentId,
        agentName: agentName,
        department: data.department,
        startDate: data.signatureDate.toISOString(),
        endDate: '', // This would be calculated based on duration
        status: data.status,
        value: 0, // This would be calculated
        contractType: data.contractType,
        typology: data.typology,
        insertionDate: formatISO(data.insertionDate),
    };

    // In a real app, this would be a server call to a database.
    // For this demo, we push to an in-memory array.
    contracts.push(newContract);
    
    console.log("New contract created:", JSON.stringify(newContract, null, 2));

    try {
      await sendNotificationFlow({
        contractId: newContractId,
        clientId: data.clientId,
        agentId: data.agentId,
        department: data.department,
        signatureDate: format(data.signatureDate, 'dd/MM/yyyy'),
        status: data.status,
      });

      toast({
        title: 'Contratto Creato',
        description: `Il contratto ${newContractId} è stato salvato e la notifica è stata inviata.`,
      });
      router.push('/contracts');
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast({
        variant: 'destructive',
        title: 'Errore Notifica',
        description: `Impossibile inviare la notifica per il nuovo contratto. ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuovo Contratto</h1>
          <p className="text-muted-foreground">Carica i documenti o compila manualmente</p>
        </div>
        <div className='flex gap-2'>
             <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Indietro
            </Button>
            <Button type="submit" form="contract-form">
              <Save className="mr-2 h-4 w-4" />
              Salva Contratto
            </Button>
        </div>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Analisi Automatica con AI</CardTitle>
          <CardDescription>Carica le pagine del contratto (foto o PDF) e lascia che l'IA compili il modulo per te.</CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className={cn("border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer", isDragActive && "border-primary bg-primary/10")}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              {isDragActive ? <p>Rilascia i file qui...</p> : <p>Trascina i file qui, o clicca per selezionarli</p>}
              <p className="text-xs">Immagini (JPG, PNG) o PDF</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">File selezionati:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-2">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <Image src={file.preview} alt={file.name} width={150} height={150} className="rounded-md object-cover aspect-square" />
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-muted rounded-md aspect-square p-2">
                        <FileIcon className="h-10 w-10 text-muted-foreground" />
                        <span className="text-xs text-center break-all mt-2">{file.name}</span>
                      </div>
                    )}
                    <button onClick={() => removeFile(file)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={handleAiParsing} disabled={files.length === 0 || isParsing} className="mt-4">
            {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Analizza Documenti
          </Button>
        </CardContent>
      </Card>

      <Form {...form}>
        <form id="contract-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="base" className="w-full">
                <TabsList>
                    <TabsTrigger value="base">Informazioni Base</TabsTrigger>
                    {(department === 'Energia' || department === 'Telefonia' || department === 'Noleggio') && <TabsTrigger value="offer">Offerta</TabsTrigger>}
                    {department === 'Energia' && <TabsTrigger value="details">Dettagli Servizio</TabsTrigger>}
                </TabsList>
                <TabsContent value="base">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informazioni Base</CardTitle>
                        <CardDescription>Inserisci le informazioni di base del contratto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FormItem>
                                <FormLabel>Numero Contratto</FormLabel>
                                <FormControl>
                                    <Input disabled placeholder="Generato automaticamente" />
                                </FormControl>
                            </FormItem>
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stato</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Seleziona stato" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="In attesa">In attesa</SelectItem>
                                            <SelectItem value="Attivo">Attivo</SelectItem>
                                            <SelectItem value="Completato">Completato</SelectItem>
                                            <SelectItem value="Annullato">Annullato</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reparto Aziendale *</FormLabel>
                                    <Select 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue('contractType', '');
                                        form.setValue('typology', '');
                                      }} 
                                      defaultValue={field.value}
                                      value={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Seleziona reparto" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Energia">Energia</SelectItem>
                                        <SelectItem value="Telefonia">Telefonia</SelectItem>
                                        <SelectItem value="Noleggio">Noleggio</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente *</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Seleziona un cliente..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            {(department === 'Energia' || department === 'Telefonia' || department === 'Noleggio') && (
                                <FormField
                                    control={form.control}
                                    name="contractType"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo Contratto *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Seleziona un tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contractTypes.map(type => (
                                                    <SelectItem key={type.id} value={type.name}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                            
                             <FormField
                                control={form.control}
                                name="agentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Agente *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Seleziona un agente..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableAgents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            {department === 'Energia' && (
                                <FormField
                                    control={form.control}
                                    name="typology"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipologia Servizio</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Seleziona un servizio" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {defaultTypologies.map(type => (
                                                    <SelectItem key={type.id} value={type.name}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                            
                             <FormField
                                control={form.control}
                                name="signatureDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Data Firma *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "dd/MM/yyyy")
                                            ) : (
                                                <span>Seleziona data</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                              control={form.control}
                              name="insertionDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data Inserimento</FormLabel>
                                  <FormControl>
                                    <Input
                                      disabled
                                      value={field.value ? format(field.value, "dd/MM/yyyy") : ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="offer">
                    <Card>
                    <CardHeader>
                        <CardTitle>Offerta</CardTitle>
                        <CardDescription>Dettagli sull'offerta del contratto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="providerId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fornitore</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!departmentId}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={!departmentId ? "Seleziona prima un reparto" : "Seleziona fornitore"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {availableProviders.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="offerId"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Offerta</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={!selectedProviderId || availableOffers.length === 0}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={!selectedProviderId ? "Seleziona prima un fornitore" : "Seleziona offerta"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {availableOffers.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="details">
                    <Card>
                    <CardHeader>
                        <CardTitle>Dettagli Servizio</CardTitle>
                        <CardDescription>Dettagli tecnici del servizio energia.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="pdrPod"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>PDR/POD</FormLabel>
                                <FormControl>
                                <Input placeholder="Codice PDR o POD" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="annualConsumption"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Consumo Annuo (kWh/Smc)</FormLabel>
                                <FormControl>
                                <Input placeholder="Es. 3000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="activationDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Data Attivazione</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "dd/MM/yyyy")
                                        ) : (
                                            <span>Seleziona data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                                control={form.control}
                                name="contractDuration"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durata Contratto (mesi)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Es. 12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
      </Form>
    </div>
  );
}

    