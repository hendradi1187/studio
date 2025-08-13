
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    DollarSign,
    Building,
    Download,
    Eye,
    Loader2,
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
import { getContract, updateContract, deleteContract } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';

type Contract = {
    id: string;
    dataOfferId: string;
    providerId: string;
    consumerId: string;
    contractTerms: any;
    signedAt: string | null;
    terminatedAt: string | null;
    status: 'draft' | 'pending' | 'active' | 'terminated' | 'expired';
    createdAt: string;
    updatedAt: string;
    asset: {
        id: string;
        title: string;
        description: string;
        keywords: string;
        dataFormat: string;
        fileSize: number;
    };
    provider: {
        id: string;
        name: string;
        contactEmail: string;
    };
    consumer: {
        id: string;
        name: string;
        contactEmail: string;
    };
    offer: {
        price: number;
        currency: string;
        validFrom: string;
        validUntil: string;
    };
    policies: {
        access: string;
        contract: string;
    };
    transferCount: number;
};

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
    const router = useRouter();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [contract, setContract] = React.useState<Contract | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [terminateLoading, setTerminateLoading] = React.useState(false);
    const [terminationReason, setTerminationReason] = React.useState('');
    const [terminationConfirmed, setTerminationConfirmed] = React.useState(false);
    
    React.useEffect(() => {
        fetchContract();
    }, [id]);
    
    const fetchContract = async () => {
        try {
            setLoading(true);
            const data = await getContract(id);
            setContract(data);
        } catch (error) {
            console.error('Error fetching contract:', error);
            toast({
                title: "Error",
                description: "Failed to load contract details",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleTerminate = async () => {
        if (!terminationConfirmed || !terminationReason.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide a termination reason and confirm the action",
                variant: "destructive"
            });
            return;
        }
        
        try {
            setTerminateLoading(true);
            await updateContract(id, {
                status: 'terminated',
                terminatedAt: new Date().toISOString()
            });
            
            toast({
                title: "Contract Terminated",
                description: "The contract has been successfully terminated.",
                variant: "destructive"
            });
            
            // Refresh contract data
            await fetchContract();
            
        } catch (error) {
            console.error('Error terminating contract:', error);
            toast({
                title: "Error",
                description: "Failed to terminate contract",
                variant: "destructive"
            });
        } finally {
            setTerminateLoading(false);
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteContract(id);
            toast({
                title: "Contract Deleted",
                description: "Contract has been successfully deleted."
            });
            router.push('/contracts');
        } catch (error) {
            console.error('Error deleting contract:', error);
            toast({
                title: "Error",
                description: "Failed to delete contract",
                variant: "destructive"
            });
        }
    };
    
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'outline',
            pending: 'secondary',
            active: 'default',
            terminated: 'destructive',
            expired: 'destructive'
        };
        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!contract) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/contracts" className="hover:text-foreground">Contracts</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">Contract not found</span>
                </div>
                <Card>
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-medium mb-2">Contract Not Found</h3>
                        <p className="text-muted-foreground">The contract you're looking for doesn't exist or you don't have access to it.</p>
                        <Button asChild className="mt-4">
                            <Link href="/contracts">Back to Contracts</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/contracts" className="hover:text-foreground">Contracts</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground truncate">{contract.asset.title}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Cloud className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <h1 className="text-3xl font-bold">{contract.asset.title}</h1>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{contract.provider.name}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{contract.consumer.name}</span>
                            <span>•</span>
                            {getStatusBadge(contract.status)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {contract.status === 'active' && (
                        <Button>
                            <Download className="h-4 w-4 mr-2" />
                            Transfer Data
                        </Button>
                    )}
                    <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Asset
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="contract-terms">Contract Terms</TabsTrigger>
                    <TabsTrigger value="asset-details">Asset Details</TabsTrigger>
                    <TabsTrigger value="transfer-history">Transfer History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Contract Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoItem icon={FileText} label="Contract ID" value={contract.id} />
                                <InfoItem icon={DollarSign} label="Price">
                                    <p className="font-medium">
                                        {contract.offer.price > 0 ? (
                                            <span>${contract.offer.price.toLocaleString()} {contract.offer.currency}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Free</span>
                                        )}
                                    </p>
                                </InfoItem>
                                <InfoItem icon={Calendar} label="Signed Date">
                                    <p className="font-medium">
                                        {contract.signedAt ? (
                                            <>
                                                {format(new Date(contract.signedAt), 'PPP')}
                                                <span className="block text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(contract.signedAt), { addSuffix: true })}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">Not signed yet</span>
                                        )}
                                    </p>
                                </InfoItem>
                                <InfoItem icon={Calendar} label="Valid Until">
                                    <p className="font-medium">
                                        {contract.offer.validUntil ? (
                                            format(new Date(contract.offer.validUntil), 'PPP')
                                        ) : (
                                            <span className="text-muted-foreground">No expiration</span>
                                        )}
                                    </p>
                                </InfoItem>
                                <InfoItem icon={ArrowRightLeft} label="Transfers" value={contract.transferCount.toString()} />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Organizations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Provider</h4>
                                    <InfoItem icon={User} label="Organization" value={contract.provider.name} />
                                    <InfoItem icon={Link2} label="Contact" value={contract.provider.contactEmail} />
                                </div>
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2">Consumer</h4>
                                    <InfoItem icon={User} label="Organization" value={contract.consumer.name} />
                                    <InfoItem icon={Link2} label="Contact" value={contract.consumer.contactEmail} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="contract-terms" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem icon={FileText} label="Access Policy" value={contract.policies.access || 'Not specified'} />
                                <InfoItem icon={FileText} label="Contract Policy" value={contract.policies.contract || 'Not specified'} />
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-4">Contract Terms</h4>
                                <div className="bg-muted p-4 rounded-md">
                                    <pre className="text-sm whitespace-pre-wrap">
                                        {JSON.stringify(contract.contractTerms, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t">
                            {contract.status === 'active' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Terminate Contract</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Terminate Contract</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Please provide a reason for termination. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4 space-y-4">
                                            <Textarea 
                                                placeholder="Detailed reason for termination..."
                                                value={terminationReason}
                                                onChange={(e) => setTerminationReason(e.target.value)}
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="terms-termination" 
                                                    checked={terminationConfirmed}
                                                    onCheckedChange={(checked) => setTerminationConfirmed(checked === true)}
                                                />
                                                <Label htmlFor="terms-termination" className="text-sm font-normal">
                                                    I understand the consequences of terminating a contract.
                                                </Label>
                                            </div>
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleTerminate} 
                                                disabled={terminateLoading}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {terminateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Terminate
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            
                            {contract.status === 'draft' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete Draft</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Draft Contract</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this draft contract? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                </TabsContent>
                
                <TabsContent value="asset-details" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cloud className="h-5 w-5" />
                                Asset Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InfoItem icon={FileText} label="Asset ID" value={contract.asset.id} />
                                <InfoItem icon={FileText} label="Data Format" value={contract.asset.dataFormat} />
                                <InfoItem icon={ArrowRightLeft} label="File Size" value={formatFileSize(contract.asset.fileSize)} />
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{contract.asset.description}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {contract.asset.keywords.split(',').map((keyword, index) => (
                                        <Badge key={index} variant="outline">
                                            {keyword.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="transfer-history" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5" />
                                Transfer History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {contract.transferCount > 0 ? (
                                <div className="text-center py-8">
                                    <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">{contract.transferCount} Transfer(s) Completed</h3>
                                    <p className="text-muted-foreground mb-4">
                                        This contract has {contract.transferCount} successful data transfer{contract.transferCount > 1 ? 's' : ''}.
                                    </p>
                                    <Button variant="outline">
                                        View Transfer Details
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Transfers Yet</h3>
                                    <p className="text-muted-foreground">No data transfers have been initiated for this contract.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
