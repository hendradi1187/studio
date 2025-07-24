'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check, Copy, ExternalLink, GitBranch, Github, Link as LinkIcon, Rss, Server, UserCheck, FileText, FileClock, UploadCloud, Layers, ScrollText, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <Card className="text-center">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
);

const InfoRow = ({ label, value, isLink = false, onCopy }: { label: string; value: string; isLink?: boolean; onCopy?: () => void; }) => (
    <div className="flex items-center justify-between text-sm py-2">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2 font-mono text-xs">
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {value} <ExternalLink className="h-3 w-3" />
                </a>
            ) : (
                <span>{value}</span>
            )}
            {onCopy && (
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}>
                    <Copy className="h-3 w-3" />
                </Button>
            )}
        </div>
    </div>
);


export default function DashboardPage() {

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard Konektor</h1>
        <p className="text-muted-foreground">Gambaran umum kinerja dan properti Konektor Anda.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Incoming and Outgoing Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Masuk</CardTitle>
                    <CardDescription>Proses Transfer</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    Tidak ada data
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Data Keluar</CardTitle>
                    <CardDescription>Proses Transfer</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    Tidak ada data
                </CardContent>
            </Card>

            {/* SPEKTRA Connector */}
            <Card className="lg:row-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Konektor SPEKTRA</span>
                        <Badge variant="secondary">v13.0.3</Badge>
                    </CardTitle>
                    <CardDescription>Informasi Endpoint Utama</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Bagikan informasi berikut untuk mengizinkan akses ke katalog Konektor SPEKTRA Anda.
                    </p>
                    <div>
                        <Label className="text-xs">Connector Endpoint</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <pre className="text-xs bg-muted p-2 rounded-md flex-grow truncate">http://provider/api/dsp</pre>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('http://provider/api/dsp')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <div>
                        <Label className="text-xs">Participant ID</Label>
                        <div className="flex items-center gap-2 mt-1">
                           <pre className="text-xs bg-muted p-2 rounded-md flex-grow truncate">provider</pre>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('provider')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Data Offers" value={0} />
                <StatCard title="Assets" value={0} />
                <StatCard title="Policies" value={1} />
                <StatCard title="Catalogs" value={1} />
                <StatCard title="Contract Agreements" value={0} />
            </div>

            {/* Connector Properties */}
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Properti Konektor</CardTitle>
                        <CardDescription>Properti Tambahan</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <InfoRow label="Connector Endpoint" value="http://provider/api/dsp" onCopy={() => handleCopy('http://provider/api/dsp')} />
                        <InfoRow label="Participant ID" value="provider" onCopy={() => handleCopy('provider')} />
                        <InfoRow label="Judul Konektor" value="provider Title" />
                        <InfoRow label="Versi Konektor" value="v13.0.3" />
                        <InfoRow label="Nama Organisasi Kurator" value="provider Curator" />
                        <InfoRow label="URL Kurator" value="https://provider/curator" isLink />
                        <InfoRow label="Nama Organisasi Pengelola" value="provider Maintainer" />
                        <InfoRow label="URL Pengelola" value="https://provider/maintainer" isLink />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
        {children}
    </label>
);

const ListItem = ({children}: {children: React.ReactNode}) => (
    <li className="flex items-start">
        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
)
