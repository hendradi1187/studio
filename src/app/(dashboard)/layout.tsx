
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Home,
  FileClock,
  UploadCloud,
  Layers,
  ScrollText,
  KeyRound,
  ChevronRight,
  ChevronDown,
  Users,
  Database,
  BookUser,
  Settings,
  ShieldCheck,
} from 'lucide-react';

import { SpektraLogo } from '@/components/spektra-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const NavItem = ({ href, icon: Icon, children }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Link>
    </li>
  );
};


interface NavGroupProps {
    label: string;
    children: React.ReactNode;
}

const NavGroup = ({ label, children }: NavGroupProps) => {
    const [isOpen, setIsOpen] = React.useState(true);
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
            <CollapsibleTrigger className="w-full text-left">
                 <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {label}
                    </span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                 </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                 <ul className="space-y-1 ml-4 border-l pl-4">
                    {children}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <SpektraLogo />
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <ul className="space-y-1">
            <NavItem href="/dashboard" icon={Home}>Dashboard</NavItem>
            <NavItem href="#" icon={FileText}>Contracts</NavItem>
            <NavItem href="/logs" icon={FileClock}>Transfer History</NavItem>
          </ul>
          
          <NavGroup label="Consume">
            <NavItem href="/vocabulary" icon={BookUser}>Catalog Browser</NavItem>
          </NavGroup>
          
          <NavGroup label="Provide">
            <NavItem href="/offers/create" icon={UploadCloud}>New Data Offer</NavItem>
            <NavItem href="/offers" icon={Layers}>Data Offers</NavItem>
            <NavItem href="/policies" icon={ShieldCheck}>Policies</NavItem>
            <NavItem href="/assets" icon={Database}>Assets</NavItem>
          </NavGroup>

          <NavGroup label="Administration">
            <NavItem href="/users" icon={Users}>User Management</NavItem>
            <NavItem href="/broker" icon={KeyRound}>Connector Status</NavItem>
            <NavItem href="/settings" icon={Settings}>Notification Settings</NavItem>
          </NavGroup>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  <AvatarImage src="https://placehold.co/32x32" alt="Admin" data-ai-hint="user avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              <DropdownMenuItem>Dukungan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Keluar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}
