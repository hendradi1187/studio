
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronRight,
    Cloud,
    FileText,
    User,
    Calendar,
    ArrowRightLeft,
    Link2,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const InfoItem = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string, children?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {value && <p className="font-medium">{value}</p>}
            {children}
        </div>
    </div>
);

const PolicyViolation = ({ text }: { text: string }) => (
    <div className="flex items-start gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{text}</span>
    </div>
);

export default function ContractDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const handleTerminate = () => {
    toast({
        title: "Contract Termination Initiated",
        description: "The contract is being terminated.",
        variant: "destructive"
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/contracts" className="hover:text-foreground">Contracts</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{id}</span>
        </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Cloud className="h-8 w-8 text-muted-foreground" />
            <div>
                <h1 className="text-3xl font-bold">demotest</h1>
                 <div className="text-sm text-muted-foreground flex items-center">
                    <span>provider</span>
                    <ArrowRight className="h-3 w-3 mx-1" />
                    <span>You</span>
                </div>
            </div>
        </div>
        <Button>Transfer</Button>
      </div>

      <Tabs defaultValue="contract-agreement">
        <TabsList>
            <TabsTrigger value="contract-agreement">Contract Agreement</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="transfer-history">Transfer History</TabsTrigger>
        </TabsList>
        <TabsContent value="contract-agreement" className="pt-4">
           <Card>
                <CardContent className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoItem icon={FileText} label="Contract Agreement ID" value={id} />
                        <InfoItem icon={Calendar} label="Signed At" value="10/07/2025 09:45:48" />
                        <InfoItem icon={ArrowRightLeft} label="Direction" value="CONSUMING" />
                        <InfoItem icon={User} label="Counter Party ID" value="provider" />
                        <InfoItem icon={Link2} label="Counter Party Connector Endpoint">
                             <div className="font-mono text-xs bg-muted p-2 rounded-md">http://provider/api/dsp</div>
                        </InfoItem>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Contract Policy</h4>
                        <div className="space-y-3">
                            <PolicyViolation text="$: Policy has an assigner, which is currently unsupported." />
                            <PolicyViolation text="$: Policy has an assignee, which is currently unsupported." />
                            <PolicyViolation text="$: Policy does not have type SET, but CONTRACT, which is currently unsupported." />
                            <p className="text-sm">Unrestricted</p>
                        </div>
                    </div>
                </CardContent>
                <CardHeader className="flex flex-row items-center justify-between border-t">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Terminate</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Terminate Contract</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please provide a reason for termination. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-4">
                                <Textarea placeholder="Detailed reason for termination..." />
                                <div className="flex items-center space-x-2">
                                <Checkbox id="terms-termination" />
                                <Label htmlFor="terms-termination" className="text-sm font-normal">
                                    I understand the consequences of terminating a contract.
                                </Label>
                                </div>
                            </div>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleTerminate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Terminate
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="link">Show JSON-LD</Button>
                </CardHeader>
           </Card>
        </TabsContent>
         <TabsContent value="overview">
             <Card><CardContent className="p-6">Overview content goes here.</CardContent></Card>
        </TabsContent>
         <TabsContent value="properties">
             <Card><CardContent className="p-6">Properties content goes here.</CardContent></Card>
        </Tabs-Content>
         <TabsContent value="transfer-history">
             <Card><CardContent className="p-6">Transfer history content goes here.</CardContent></Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}

