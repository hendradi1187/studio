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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Incoming and Outgoing Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Data</CardTitle>
                    <CardDescription>Transfer Processes</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    No data
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Outgoing Data</CardTitle>
                    <CardDescription>Transfer Processes</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    No data
                </CardContent>
            </Card>

            {/* EDC Connector */}
            <Card className="lg:row-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>EDC Connector</span>
                        <Badge variant="secondary">v13.0.3</Badge>
                    </CardTitle>
                    <CardDescription>provider Title</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Share the following Connector Endpoint to let others access your EDC Connector's catalog.
                    </p>
                    <div>
                        <Label className="text-xs">Connector Endpoint + Participant ID</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <pre className="text-xs bg-muted p-2 rounded-md flex-grow truncate">http://provider/api/dsp?participantid=provider</pre>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('http://provider/api/dsp?participantid=provider')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <div>
                        <Label className="text-xs">Management API URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                           <pre className="text-xs bg-muted p-2 rounded-md flex-grow truncate">http://provider/api/management</pre>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('http://provider/api/management')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Your Data Offers" value={0} />
                <StatCard title="Your Assets" value={0} />
                <StatCard title="Your Policies" value={1} />
                <StatCard title="Preconfigured Catalogs" value={1} />
                <StatCard title="Contract Agreements" value={0} />
            </div>

            {/* Connector Properties */}
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Connector Properties</CardTitle>
                        <CardDescription>Additional Properties</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <InfoRow label="Connector Endpoint" value="http://provider/api/dsp" onCopy={() => handleCopy('http://provider/api/dsp')} />
                        <InfoRow label="Participant ID" value="provider" onCopy={() => handleCopy('provider')} />
                        <InfoRow label="Title" value="provider Title" />
                        <InfoRow label="Connector Version" value="v13.0.3" />
                        <InfoRow label="Curator Organization Name" value="provider Curator" />
                        <InfoRow label="Curator URL" value="https://provider/curator" isLink />
                        <InfoRow label="Maintainer Organization Name" value="provider Maintainer" />
                        <InfoRow label="Maintainer URL" value="https://provider/maintainer" isLink />
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>About EDC</CardTitle>
                    <CardDescription>Eclipse Dataspace Components</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        The Eclipse Dataspace Components framework facilitates sovereign, inter-organizational data exchange. It implements the International Data Spaces standard (IDS) as well as relevant protocols associated with GAIA-X.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        The framework is designed as extensible as possible to encourage integrations into various data ecosystems.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Get Managed EDC</CardTitle>
                    <CardDescription>Connector-as-a-Service</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        To join data spaces like Catena-X within minutes, consider the managed solution by sovity. The Connector-as-a-Service (CaaS) is based on open-source software enriched with key enterprise features.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <span className="text-sm font-semibold flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-primary" /> sovity
                    </span>
                    <Button>Contact</Button>
                </CardFooter>
            </Card>
        </div>
        
         <Card>
            <CardHeader>
                <CardTitle>About EDC UI</CardTitle>
                <CardDescription>Data Dashboard</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Example use cases, that you can try out with this application, are:
                </p>
                <ul className="space-y-2 text-sm">
                    <ListItem>View the asset catalog available to you in your Dataspace using the <span className="text-link">Catalog Browser</span></ListItem>
                    <ListItem>Negotiate a contract for data sharing in your Dataspace using the <span className="text-link">Catalog Browser</span></ListItem>
                    <ListItem>View your existing contracts in the <span className="text-link">Contract Page</span></ListItem>
                    <ListItem>Transfer an asset in your Dataspace using the <span className="text-link">Contract Page</span></ListItem>
                    <ListItem>View which assets have been transferred in your Dataspace in the <span className="text-link">Transfer History Page</span></ListItem>
                    <ListItem>View and create assets using the <span className="text-link">Asset Page</span></ListItem>
                    <ListItem>View and create policies and apply these to assets in your Dataspace using the <span className="text-link">Policy Page</span></ListItem>
                    <ListItem>Publish an asset into your Dataspace using the <span className="text-link">Data Offer Page</span></ListItem>
                </ul>
            </CardContent>
        </Card>
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
