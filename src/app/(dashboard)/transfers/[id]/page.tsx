'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ChevronRight,
    Cloud,
    FileText,
    User,
    Calendar,
    ArrowRightLeft,
    Download,
    Upload,
    Play,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    Building,
    DollarSign,
    HardDrive,
    Timer,
    Eye,
    RefreshCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getTransfer, updateTransfer } from '@/lib/api';
import { format, formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

type Transfer = {
    id: string;
    contractId: string;
    transferType: 'download' | 'stream' | 'api_access';
    transferState: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    filePath: string | null;
    fileSize: number | null;
    bytesTransferred: number;
    transferStart: string;
    transferEnd: string | null;
    errorMessage: string | null;
    metadata: any;
    createdAt: string;
    updatedAt: string;
    contract: {
        id: string;
        status: string;
        signedAt: string;
    };
    asset: {
        id: string;
        title: string;
        description: string;
        dataFormat: string;
        fileSize: number;
        keywords: string;
    };
    provider: {
        name: string;
        contactEmail: string;
    };
    consumer: {
        name: string;
        contactEmail: string;
    };
    offer: {
        price: number;
        currency: string;
        validFrom: string;
        validUntil: string;
    };
};

const InfoItem = ({ icon: Icon, label, value, children }: { 
    icon: React.ElementType, 
    label: string, 
    value?: string, 
    children?: React.ReactNode 
}) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {value && <p className="font-medium">{value}</p>}
            {children}
        </div>
    </div>
);

export default function TransferDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [transfer, setTransfer] = React.useState<Transfer | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [retryLoading, setRetryLoading] = React.useState(false);
    
    React.useEffect(() => {
        fetchTransfer();
    }, [id]);
    
    const fetchTransfer = async () => {
        try {
            setLoading(true);
            const data = await getTransfer(id);
            setTransfer(data);
        } catch (error) {
            console.error('Error fetching transfer:', error);
            toast({
                title: "Error",
                description: "Failed to load transfer details",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleRetry = async () => {
        if (!transfer || transfer.transferState !== 'failed') return;
        
        try {
            setRetryLoading(true);
            await updateTransfer(id, {
                transferState: 'initiated',
                errorMessage: undefined
            });
            
            toast({
                title: "Transfer Retried",
                description: "The transfer has been restarted."
            });
            
            // Refresh transfer data
            await fetchTransfer();
            
        } catch (error) {
            console.error('Error retrying transfer:', error);
            toast({
                title: "Error",
                description: "Failed to retry transfer",
                variant: "destructive"
            });
        } finally {
            setRetryLoading(false);
        }
    };
    
    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ElementType }> = {
            initiated: { variant: 'outline', icon: Clock },
            in_progress: { variant: 'secondary', icon: Loader2 },
            completed: { variant: 'default', icon: CheckCircle },
            failed: { variant: 'destructive', icon: XCircle },
            cancelled: { variant: 'destructive', icon: XCircle }
        };
        
        const { variant, icon: Icon } = config[status] || { variant: 'outline', icon: Clock };
        
        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Badge>
        );
    };
    
    const getTransferTypeIcon = (type: string) => {
        const icons = {
            download: Download,
            upload: Upload,
            stream: Play,
            api_access: Cloud
        };
        return icons[type as keyof typeof icons] || Download;
    };
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const getProgressPercentage = (bytesTransferred: number, fileSize: number | null) => {
        if (!fileSize || fileSize === 0) return 0;
        return Math.round((bytesTransferred / fileSize) * 100);
    };
    
    const getTransferDuration = (start: string, end: string | null) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        
        const duration = intervalToDuration({
            start: startDate,
            end: endDate
        });
        
        return formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] }) || 'Less than a second';
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!transfer) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/transfers" className="hover:text-foreground">Transfers</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">Transfer not found</span>
                </div>
                <Card>
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-medium mb-2">Transfer Not Found</h3>
                        <p className="text-muted-foreground">The transfer you're looking for doesn't exist or you don't have access to it.</p>
                        <Button asChild className="mt-4">
                            <Link href="/transfers">Back to Transfers</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const TypeIcon = getTransferTypeIcon(transfer.transferType);
    const progress = getProgressPercentage(transfer.bytesTransferred, transfer.fileSize);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/transfers" className="hover:text-foreground">Transfers</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground truncate">{transfer.asset.title}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <TypeIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <h1 className="text-3xl font-bold">{transfer.asset.title}</h1>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{transfer.provider.name}</span>
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>{transfer.consumer.name}</span>
                            <span>•</span>
                            {getStatusBadge(transfer.transferState)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {transfer.transferState === 'failed' && (
                        <Button 
                            variant="outline" 
                            onClick={handleRetry}
                            disabled={retryLoading}
                        >
                            {retryLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Retry Transfer
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/contracts/${transfer.contractId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Contract
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="progress">Progress Details</TabsTrigger>
                    <TabsTrigger value="asset-info">Asset Information</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Transfer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoItem icon={FileText} label="Transfer ID" value={transfer.id} />
                                <InfoItem icon={FileText} label="Contract ID" value={transfer.contractId} />
                                <InfoItem icon={ArrowRightLeft} label="Transfer Type">
                                    <Badge variant="outline">
                                        {transfer.transferType.charAt(0).toUpperCase() + transfer.transferType.slice(1).replace('_', ' ')}
                                    </Badge>
                                </InfoItem>
                                <InfoItem icon={Calendar} label="Started">
                                    <p className="font-medium">
                                        {format(new Date(transfer.transferStart), 'PPpp')}
                                        <span className="block text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(transfer.transferStart), { addSuffix: true })}
                                        </span>
                                    </p>
                                </InfoItem>
                                <InfoItem icon={Timer} label="Duration">
                                    <p className="font-medium">
                                        {getTransferDuration(transfer.transferStart, transfer.transferEnd)}
                                        {!transfer.transferEnd && transfer.transferState === 'in_progress' && (
                                            <span className="text-muted-foreground"> (ongoing)</span>
                                        )}
                                    </p>
                                </InfoItem>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Organizations & Contract
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Provider</h4>
                                    <InfoItem icon={User} label="Organization" value={transfer.provider.name} />
                                    <InfoItem icon={FileText} label="Contact" value={transfer.provider.contactEmail} />
                                </div>
                                <div className="pt-2 border-t">
                                    <h4 className="font-medium mb-2">Consumer</h4>
                                    <InfoItem icon={User} label="Organization" value={transfer.consumer.name} />
                                    <InfoItem icon={FileText} label="Contact" value={transfer.consumer.contactEmail} />
                                </div>
                                <div className="pt-2 border-t">
                                    <InfoItem icon={DollarSign} label="Contract Value">
                                        <p className="font-medium">
                                            {transfer.offer.price > 0 ? (
                                                <span>${transfer.offer.price.toLocaleString()} {transfer.offer.currency}</span>
                                            ) : (
                                                <span className="text-muted-foreground">Free</span>
                                            )}
                                        </p>
                                    </InfoItem>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="progress" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5" />
                                Transfer Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {transfer.fileSize ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Progress</span>
                                        <span className="text-sm text-muted-foreground">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-3" />
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Transferred:</span>
                                            <p className="font-medium">{formatFileSize(transfer.bytesTransferred)}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Size:</span>
                                            <p className="font-medium">{formatFileSize(transfer.fileSize)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Size Information</h3>
                                    <p className="text-muted-foreground">
                                        {transfer.transferType === 'api_access' 
                                            ? 'This is an API access transfer with no file size.'
                                            : 'File size information is not available for this transfer.'
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {transfer.errorMessage && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-destructive mb-1">Transfer Error</h4>
                                            <p className="text-sm text-muted-foreground">{transfer.errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {transfer.filePath && (
                                <div className="bg-muted p-4 rounded-md">
                                    <InfoItem icon={FileText} label="File Path">
                                        <code className="text-sm bg-background px-2 py-1 rounded">
                                            {transfer.filePath}
                                        </code>
                                    </InfoItem>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="asset-info" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cloud className="h-5 w-5" />
                                Asset Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoItem icon={FileText} label="Asset ID" value={transfer.asset.id} />
                                <InfoItem icon={FileText} label="Data Format" value={transfer.asset.dataFormat} />
                                <InfoItem icon={HardDrive} label="Asset Size" value={formatFileSize(transfer.asset.fileSize)} />
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{transfer.asset.description}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {transfer.asset.keywords.split(',').map((keyword, index) => (
                                        <Badge key={index} variant="outline">
                                            {keyword.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="metadata" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Transfer Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted p-4 rounded-md">
                                <pre className="text-sm whitespace-pre-wrap overflow-auto">
                                    {JSON.stringify(transfer.metadata, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}