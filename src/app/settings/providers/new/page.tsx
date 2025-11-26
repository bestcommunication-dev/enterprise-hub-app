'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { providers, departments } from '@/lib/data';
import { Provider } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'Il nome deve essere di almeno 2 caratteri.'),
  departmentId: z.enum(['energia', 'telefonia', 'noleggio'], { required_error: "Il reparto è obbligatorio."}),
});

export default function NewProviderPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // In a real app, this would be a server action.
    const newProvider: Provider = {
        id: `provider-${Date.now()}`,
        name: data.name,
        departmentId: data.departmentId,
    };
    providers.push(newProvider);

    toast({
      title: 'Fornitore Creato',
      description: `Il fornitore "${data.name}" è stato salvato con successo.`,
    });
    router.push('/settings/providers');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuovo Fornitore</h1>
          <p className="text-muted-foreground">Inserisci i dati per creare un nuovo fornitore.</p>
        </div>
         <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/settings/providers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Indietro
                </Link>
            </Button>
            <Button type="submit" form="new-provider-form">
                <Save className="mr-2 h-4 w-4" />
                Salva Fornitore
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli Fornitore</CardTitle>
          <CardDescription>Compila i dati del nuovo fornitore.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form id="new-provider-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Fornitore *</FormLabel>
                            <FormControl>
                            <Input placeholder="Es. Enel Energia" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
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
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
