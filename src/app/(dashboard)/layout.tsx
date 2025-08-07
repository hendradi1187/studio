
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
  PanelLeft,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  User,
  GitBranch,
  BookA,
} from 'lucide-react';

import { SpektraLogo } from '@/components/spektra-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/theme-provider";


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badgeCount?: number;
}

const NavItem = ({ href, icon: Icon, children, badgeCount }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-slate-300 hover:bg-primary/10 hover:text-primary'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{children}</span>
        {badgeCount && badgeCount > 0 && (
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">{badgeCount}</span>
        )}
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
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {label}
                    </span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                 </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                 <ul className="space-y-1 ml-4 border-l border-slate-700 pl-4">
                    {children}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    )
}

const SidebarNav = () => (
    <nav className="flex-1 space-y-2 p-4">
        <ul className="space-y-1">
        <NavItem href="/dashboard" icon={Home}>Dashboard</NavItem>
        <NavItem href="/contracts" icon={FileText} >Contracts</NavItem>
        <NavItem href="/logs" icon={FileClock}>Transfer History</NavItem>
        </ul>
        
        <NavGroup label="Consume">
        <NavItem href="/catalog" icon={BookUser}>Catalog Browser</NavItem>
        </NavGroup>
        
        <NavGroup label="Provide">
        <NavItem href="/offers" icon={Layers}>Data Offers</NavItem>
        <NavItem href="/policies" icon={ShieldCheck}>Policies</NavItem>
        <NavItem href="/assets" icon={Database}>Assets</NavItem>
        </NavGroup>

        <NavGroup label="Administration">
        <NavItem href="/users" icon={Users}>User Management</NavItem>
        <NavItem href="/broker" icon={GitBranch}>Connector Status</NavItem>
        <NavItem href="/vocabulary" icon={BookA}>Vocabulary</NavItem>
        <NavItem href="/settings" icon={Settings}>Notification Settings</NavItem>
        </NavGroup>
    </nav>
);

const UserMenu = () => {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                <AvatarImage src="https://placehold.co/32x32" alt="Admin" data-ai-hint="user avatar" />
                <AvatarFallback>AD</AvatarFallback>
                </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        admin@spektra.com
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
             <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>Toggle Theme</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
                <Link href="/sign-in">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </Link>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const Breadcrumbs = () => {
    const pathname = usePathname();
    const pathParts = pathname.split('/').filter(part => part);
    
    if (pathParts.length === 0) {
        return null;
    }

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            {pathParts.map((part, index) => {
                const href = '/' + pathParts.slice(0, index + 1).join('/');
                const isLast = index === pathParts.length - 1;
                const name = part.split('-').map(capitalize).join(' ');

                if (name === 'Dashboard') return null;

                return (
                    <React.Fragment key={href}>
                         <ChevronRight className="h-4 w-4" />
                         <Link href={href} className={cn(isLast ? 'text-foreground' : 'hover:text-foreground')}>
                            {name}
                        </Link>
                    </React.Fragment>
                )
            })}
        </nav>
    );
}

const Header = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs bg-slate-800 border-r-0 p-0">
                <div className="flex h-20 items-center justify-center border-b border-b-slate-700">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <SpektraLogo />
                    </Link>
                </div>
                <SidebarNav />
            </SheetContent>
        </Sheet>
        
        <Breadcrumbs />

        <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
            <UserMenu />
        </div>
    </header>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
    >
        <div className="flex min-h-screen w-full">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-slate-800 sm:flex">
                <div className="flex h-20 items-center justify-center border-b border-b-slate-700 px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
                    <SpektraLogo />
                </Link>
                </div>
                <SidebarNav />
            </aside>
            <div className="flex flex-col sm:pl-72 w-full">
                <Header />
                <main className="flex-1 p-4 sm:p-6 bg-background animate-fade-in">{children}</main>
            </div>
        </div>
    </ThemeProvider>
  );
}
