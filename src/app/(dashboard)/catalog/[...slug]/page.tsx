
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Database,
  FileText,
  Link as LinkIcon,
  Globe,
  Tag,
  Code,
  User,
  Building,
  Copy,
  FileQuestion,
  Book,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const PropertyItem = ({ icon: Icon, label, value, isLink = false, onCopy }: { icon: React.ElementType, label: string, value: string, isLink?: boolean, onCopy?: () => void }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                 {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{value}</a>
                 ) : (
                    <p className="font-medium">{value}</p>
                 )}
                 {onCopy && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    </div>
);


export default function CatalogOfferDetailPage({ params }: { params: { slug: string[] } }) {
  const [provider, demotest] = params.slug || [];
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
    })
  };


  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/catalog" className="hover:text-foreground">Catalog Browser</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/catalog/${provider}`} className="hover:text-foreground capitalize">{provider}</Link>
             <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{demotest}</span>
        </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Database className="h-8 w-8 text-muted-foreground" />
            <div>
                <h1 className="text-3xl font-bold">DemoTest</h1>
                <p className="text-muted-foreground">{demotest}</p>
            </div>
        </div>
        <Button>Negotiate</Button>
      </div>

      <Tabs defaultValue="properties">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="contract-offers">Contract Offers</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="pt-4">
           <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       <PropertyItem icon={Tag} label="Id" value="demotest" />
                       <PropertyItem icon={GitBranch} label="Version" value="1.0.0" />
                       <PropertyItem icon={Globe} label="Language" value="German" />
                       <PropertyItem icon={Book} label="Endpoint Documentation" value="https://www.google.com" isLink/>
                       <PropertyItem icon={User} label="Participant ID" value="provider" />
                       <PropertyItem icon={Building} label="Organization" value="provider Curator" />
                       <PropertyItem icon={LinkIcon} label="Connector Endpoint" value="http://provider/api/dsp" onCopy={() => handleCopy('http://provider/api/dsp')} />
                       <PropertyItem icon={Code} label="Content Type" value="application/json" />
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle className="text-xl">Additional Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                             <FileQuestion className="h-5 w-5 text-muted-foreground" />
                             <div>
                                 <p className="text-xs text-muted-foreground">Data Samples</p>
                                 <Button variant="link" className="p-0 h-auto font-medium">Show Data Samples</Button>
                             </div>
                        </div>
                         <div className="flex items-center gap-3">
                             <FileText className="h-5 w-5 text-muted-foreground" />
                             <div>
                                 <p className="text-xs text-muted-foreground">Reference Files</p>
                                 <Button variant="link" className="p-0 h-auto font-medium">Show Reference Files</Button>
                             </div>
                        </div>
                    </CardContent>
                </Card>
           </div>
        </TabsContent>
         <TabsContent value="overview">
             <Card><CardContent className="p-6">Overview content goes here.</CardContent></Card>
        </TabsContent>
         <TabsContent value="contract-offers">
             <Card><CardContent className="p-6">Contract offers content goes here.</CardContent></Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
