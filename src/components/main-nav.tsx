'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { users } from '@/lib/data';
import { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Briefcase, Wallet, Archive, BarChartHorizontal, TestTube2, Settings, Database } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Back-Office', 'Agent'] },
  { href: '/clients', label: 'Clienti', icon: Users, roles: ['Admin', 'Back-Office', 'Agent'] },
  { href: '/contracts', label: 'Contratti', icon: Briefcase, roles: ['Admin', 'Back-Office', 'Agent'] },
  { href: '/files', label: 'Archivio', icon: Archive, roles: ['Admin', 'Back-Office', 'Agent'] },
  { href: '/commissions', label: 'Provvigioni', icon: Wallet, roles: ['Admin', 'Agent'] },
  { href: '/reports', label: 'Reportistica', icon: BarChartHorizontal, roles: ['Admin', 'Back-Office'] },
  { 
    id: 'anagrafiche',
    label: 'Anagrafiche', 
    icon: Settings, 
    roles: ['Admin', 'Back-Office'],
    subItems: [
        { href: '/settings/offers', label: 'Offerte', roles: ['Admin', 'Back-Office'] },
        { href: '/settings/providers', label: 'Fornitori', roles: ['Admin', 'Back-Office'] },
    ]
  },
  { 
    id: 'strumenti',
    label: 'Strumenti', 
    icon: TestTube2, 
    roles: ['Admin', 'Back-Office'],
    subItems: [
        { href: '/commission-calculator', label: 'Calcolatore', roles: ['Admin', 'Back-Office'] },
        { href: '/agent-simulator', label: 'Simulatore Agente', roles: ['Admin', 'Back-Office'] },
    ]
  },
];

const devNavItems = [
    { href: 'http://localhost:4000/firestore', label: 'Database', icon: Database, roles: ['Admin', 'Back-Office', 'Agent'], external: true },
];


export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const mockUser = user ? users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) : undefined;
  
  if (isUserLoading || !mockUser) {
    return null;
  }

  const userRole = mockUser.role as Role;

  const accessibleNavItems = navItems.filter(item => {
    if (!item.roles.includes(userRole)) return false;
    if (item.subItems) {
      item.subItems = item.subItems.filter(sub => sub.roles.includes(userRole));
      return item.subItems.length > 0;
    }
    return true;
  });

  return (
    <nav className={cn('flex flex-col space-y-2 p-4 pt-6', className)} {...props}>
      {accessibleNavItems.map((item) => (
        <div key={item.id || item.href}>
          {item.subItems && item.subItems.length > 0 ? (
            <div>
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</h4>
              <div className="mt-2 space-y-1">
                {item.subItems.map(subItem => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md py-2 px-3 text-sm font-medium transition-colors',
                      pathname.startsWith(subItem.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    )}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
             item.href && (
                <Link
                href={item.href}
                className={cn(
                    'flex items-center gap-3 rounded-md py-2 px-3 text-sm font-medium transition-colors',
                    (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/'))
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                )}
                >
                <item.icon className="h-5 w-5" />
                {item.label}
                </Link>
             )
          )}
        </div>
      ))}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-auto pt-4 border-t border-border">
             <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sviluppo</h4>
            {devNavItems.map((item) => (
                 <Link
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'flex items-center gap-3 rounded-md py-2 px-3 text-sm font-medium transition-colors',
                        'text-foreground hover:bg-accent'
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                 </Link>
            ))}
        </div>
      )}
    </nav>
  );
}
