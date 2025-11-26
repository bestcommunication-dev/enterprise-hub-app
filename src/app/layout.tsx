'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { users } from '@/lib/data';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Loader2 } from 'lucide-react';
import { ForcePasswordChangeDialog } from '@/components/force-password-change-dialog';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppContent>{children}</AppContent>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  useEffect(() => {
    if (user?.metadata.creationTime && user?.metadata.lastSignInTime) {
      const creation = new Date(user.metadata.creationTime).getTime();
      const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
      
      const threshold = 10 * 1000; // 10 seconds
      if (Math.abs(lastSignIn - creation) < threshold) {
        setShowPasswordChange(true);
      } else {
        setShowPasswordChange(false);
      }
    } else {
      setShowPasswordChange(false);
    }
  }, [user]);

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  if (isUserLoading || !user || !mockUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const displayUser = {
      ...user,
      name: mockUser.name,
      role: mockUser.role,
  };

  return (
    <SidebarProvider>
      {showPasswordChange && <ForcePasswordChangeDialog user={user} onPasswordChanged={() => setShowPasswordChange(false)} />}
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-3">
             <div className="flex items-center gap-2">
                <UserNav user={displayUser}/>
                <div className='flex flex-col'>
                    <span className="text-sm font-semibold">{displayUser.name}</span>
                    <span className="text-xs text-muted-foreground">{displayUser.role}</span>
                </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t p-2">
            
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col w-full bg-[#F8F9FA]">
           <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
            </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
