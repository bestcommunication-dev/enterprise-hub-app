'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { users } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Edit } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  if (isUserLoading || !user || !mockUser) {
    return <div>Loading...</div>;
  }
  
  const getInitials = (name: string): string => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`;
    }
    return name.substring(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserIcon className="h-8 w-8" />
          Il Mio Profilo
        </h1>
         <Button>
            <Edit className="mr-2 h-4 w-4" />
            Modifica Profilo
          </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || ''} alt={mockUser.name} />
              <AvatarFallback className="text-2xl">{getInitials(mockUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
              <CardDescription>{mockUser.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={mockUser.name} disabled />
             </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={mockUser.email} disabled />
             </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="role">Ruolo</Label>
                <Input id="role" value={mockUser.role} disabled />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
