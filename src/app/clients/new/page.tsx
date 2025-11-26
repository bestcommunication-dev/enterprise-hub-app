'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

const baseSchema = z.object({
  status: z.enum(['Attivo', 'Inattivo', 'Lead'], {
    required_error: "Lo stato è obbligatorio",
  }),
  email: z.string().email('Formato email non valido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const privateClientSchema = baseSchema.extend({
  clientType: z.literal('Private'),
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  fiscalCode: z.string().min(1, 'Il codice fiscale è obbligatorio'),
  businessName: z.undefined(),
  vatNumber: z.undefined(),
  pec: z.undefined(),
  website: z.undefined(),
  referentFirstName: z.undefined(),
  referentLastName: z.undefined(),
  referentEmail: z.undefined(),
  referentPhone: z.undefined(),
});

const businessClientSchema = baseSchema.extend({
  clientType: z.literal('Business'),
  businessName: z.string().min(1, 'La ragione sociale è obbligatoria'),
  vatNumber: z.string().min(1, 'La partita IVA è obbligatoria'),
  pec: z.string().email('Formato PEC non valido').optional().or(z.literal('')),
  website: z.string().url('URL non valido').optional().or(z.literal('')),
  referentFirstName: z.string().optional(),
  referentLastName: z.string().optional(),
  referentEmail: z.string().email("Formato email non valido").optional().or(z.literal('')),
  referentPhone: z.string().optional(),
  firstName: z.undefined(),
  lastName: z.undefined(),
  fiscalCode: z.undefined(),
});

const formSchema = z.discriminatedUnion('clientType', [privateClientSchema, businessClientSchema]);

type FormData = z.infer<typeof formSchema>;

export default function NewClientPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('principali');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: 'Private',
      status: 'Attivo',
      firstName: '',
      lastName: '',
      fiscalCode: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      province: '',
      country: 'Italia',
      notes: '',
    },
  });

  const clientType = form.watch('clientType');

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast({
      title: 'Cliente Creato',
      description: `Il cliente è stato salvato con successo.`,
    });
    router.push('/clients');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuovo Cliente</h1>
          <p className="text-muted-foreground">Inserisci i dati per creare un nuovo cliente</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="principali">Informazioni Principali</TabsTrigger>
              <TabsTrigger value="contatti">Contatti e Indirizzo</TabsTrigger>
              <TabsTrigger value="aggiuntive">Informazioni Aggiuntive</TabsTrigger>
            </TabsList>
            <TabsContent value="principali">
              <Card className="max-w-4xl">
                <CardHeader>
                  <CardTitle>Informazioni Principali</CardTitle>
                  <CardDescription>Inserisci le informazioni di base del cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Cliente *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const newClientType = value as 'Private' | 'Business';
                            field.onChange(newClientType);
                            const currentData = form.getValues();
                            if (newClientType === 'Private') {
                                form.reset({ 
                                    ...currentData,
                                    clientType: 'Private', 
                                    firstName: '', 
                                    lastName: '', 
                                    fiscalCode: '',
                                    businessName: undefined,
                                    vatNumber: undefined,
                                    pec: undefined,
                                    website: undefined,
                                    referentFirstName: undefined,
                                    referentLastName: undefined,
                                    referentEmail: undefined,
                                    referentPhone: undefined,
                                });
                            } else {
                                form.reset({
                                    ...currentData,
                                    clientType: 'Business', 
                                    businessName: '', 
                                    vatNumber: '', 
                                    pec: '',
                                    website: '',
                                    referentFirstName: '',
                                    referentLastName: '',
                                    referentEmail: '',
                                    referentPhone: '',
                                    firstName: undefined,
                                    lastName: undefined,
                                    fiscalCode: undefined
                                });
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tipo cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Private">Privato</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stato *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona stato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Attivo">Attivo</SelectItem>
                            <SelectItem value="Inattivo">Inattivo</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                  {clientType === 'Private' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl>
                                <Input placeholder="Nome" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cognome *</FormLabel>
                                <FormControl>
                                <Input placeholder="Cognome" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="fiscalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Fiscale *</FormLabel>
                            <FormControl>
                              <Input placeholder="Codice Fiscale" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ragione Sociale *</FormLabel>
                                <FormControl>
                                <Input placeholder="Ragione Sociale" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="vatNumber"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Partita IVA *</FormLabel>
                                <FormControl>
                                <Input placeholder="Partita IVA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="contatti">
                 <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Contatti e Indirizzo</CardTitle>
                        <CardDescription>
                          Inserisci le informazioni di contatto e l'indirizzo del cliente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Contatti</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Email *</FormLabel>
                                      <FormControl>
                                      <Input placeholder="cliente@example.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Telefono</FormLabel>
                                      <FormControl>
                                      <Input placeholder="+39 123 456789" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              {clientType === 'Business' && (
                                <>
                                  <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Sito Web</FormLabel>
                                        <FormControl>
                                          <Input placeholder="https://www.example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name="pec"
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>PEC</FormLabel>
                                          <FormControl>
                                          <Input placeholder="indirizzo@pec.it" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                </>
                              )}
                          </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-base font-medium">{clientType === 'Private' ? 'Residenza' : 'Sede legale'}</h3>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Via</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Via e numero civico" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CAP</FormLabel>
                                        <FormControl>
                                        <Input placeholder="CAP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Città</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Città" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="province"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provincia</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Provincia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paese</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Paese" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        {clientType === 'Business' && (
                          <div className="space-y-4">
                              <h3 className="text-base font-medium">Referente</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                      control={form.control}
                                      name="referentFirstName"
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Nome Referente</FormLabel>
                                          <FormControl>
                                          <Input placeholder="Nome referente" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name="referentLastName"
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Cognome Referente</FormLabel>
                                          <FormControl>
                                          <Input placeholder="Cognome referente" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name="referentEmail"
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Email Referente</FormLabel>
                                          <FormControl>
                                          <Input placeholder="Email referente" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <FormField
                                      control={form.control}
                                      name="referentPhone"
                                      render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Telefono Referente</FormLabel>
                                          <FormControl>
                                          <Input placeholder="Telefono referente" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                              </div>
                          </div>
                        )}
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="aggiuntive">
                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Informazioni Aggiuntive</CardTitle>
                        <CardDescription>Inserisci eventuali note o informazioni extra.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Note</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Note aggiuntive sul cliente..."
                                    className="resize-none"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end max-w-4xl mt-6">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salva Cliente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
