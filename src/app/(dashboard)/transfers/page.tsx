'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Cloud,
  Search,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Download,
  Upload,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { getTransfers } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';

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
    };
    asset: {
        id: string;
        title: string;
        description: string;
        dataFormat: string;
    };
    provider: {
        name: string;
    };
    consumer: {
        name: string;
    };
    offer: {
        price: number;
        currency: string;
    };
};

export default function TransfersPage() {
    const [transfers, setTransfers] = React.useState<Transfer[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [pagination, setPagination] = React.useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchTransfers = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTransfers({
                page: pagination.page,
                limit: pagination.limit,
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                sortBy: 'created_at',
                sortOrder: 'desc'
            });
            setTransfers(response.transfers || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching transfers:', error);
            setTransfers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter]);

    React.useEffect(() => {
        fetchTransfers();
    }, [fetchTransfers]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
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

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Transfer History</h1>
                <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search transfers, assets, organizations..." 
                                className="pl-10" 
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <ToggleGroup 
                                type="single" 
                                value={statusFilter} 
                                onValueChange={handleStatusFilter} 
                                className="border rounded-md bg-background h-10 p-1"
                            >
                                {['all', 'completed', 'in_progress', 'failed'].map(status => (
                                    <ToggleGroupItem 
                                        key={status}
                                        value={status}
                                        className="text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-full px-3 text-sm"
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transfer & Asset</TableHead>
                                    <TableHead>Organizations</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Started</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                            Loading transfers...
                                        </TableCell>
                                    </TableRow>
                                ) : transfers.length > 0 ? (
                                    transfers.map((transfer) => {
                                        const TypeIcon = getTransferTypeIcon(transfer.transferType);
                                        const progress = getProgressPercentage(transfer.bytesTransferred, transfer.fileSize);
                                        
                                        return (
                                            <TableRow key={transfer.id}>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="flex items-center gap-3 w-full h-full">
                                                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium">{transfer.asset.title}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Transfer ID: {transfer.id.slice(0, 12)}...
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="block w-full h-full">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <span className="font-medium">{transfer.provider.name}</span>
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-medium">{transfer.consumer.name}</span>
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="block w-full h-full">
                                                        <Badge variant="outline">
                                                            {transfer.transferType.charAt(0).toUpperCase() + transfer.transferType.slice(1).replace('_', ' ')}
                                                        </Badge>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="block w-full h-full">
                                                        <div className="space-y-1">
                                                            {transfer.fileSize ? (
                                                                <>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span>{formatFileSize(transfer.bytesTransferred)}</span>
                                                                        <span className="text-muted-foreground">{progress}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-muted h-2 rounded-full">
                                                                        <div 
                                                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        of {formatFileSize(transfer.fileSize)}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {transfer.transferType === 'api_access' ? 'API Access' : 'Size unknown'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="block w-full h-full">
                                                        {getStatusBadge(transfer.transferState)}
                                                        {transfer.errorMessage && (
                                                            <div className="text-xs text-destructive mt-1 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Error occurred
                                                            </div>
                                                        )}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/transfers/${transfer.id}`} className="block w-full h-full">
                                                        <div className="text-sm">
                                                            {format(new Date(transfer.transferStart), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(transfer.transferStart), { addSuffix: true })}
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No transfers found</h3>
                                            <p className="text-muted-foreground">No data transfers match your current filters.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span>Rows per page</span>
                            <Select defaultValue="10">
                                <SelectTrigger className="w-20 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>
                                {transfers.length > 0 && (
                                    <>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</>
                                )}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}