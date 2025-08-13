
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Cloud,
  Search,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { getContracts } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';

type Contract = {
    id: string;
    dataOfferId: string;
    providerId: string;
    consumerId: string;
    contractTerms: any;
    signedAt: string;
    terminatedAt: string | null;
    status: 'draft' | 'pending' | 'active' | 'terminated' | 'expired';
    createdAt: string;
    updatedAt: string;
    asset: {
        id: string;
        title: string;
        description: string;
    };
    provider: {
        id: string;
        name: string;
    };
    consumer: {
        id: string;
        name: string;
    };
    price: number;
    currency: string;
    transferCount: number;
}



export default function ContractsPage() {
    const [contracts, setContracts] = React.useState<Contract[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [pagination, setPagination] = React.useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchContracts = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await getContracts({
                page: pagination.page,
                limit: pagination.limit,
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                sortBy: 'created_at',
                sortOrder: 'desc'
            });
            setContracts(response.contracts || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter]);

    React.useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
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

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Contracts</h1>

      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search contracts, assets, organizations..." 
                        className="pl-10" 
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" value={statusFilter} onValueChange={handleStatusFilter} className="border rounded-md bg-background h-10 p-1">
                        {['all', 'active', 'terminated', 'draft'].map(status => (
                            <ToggleGroupItem 
                                key={status}
                                value={status}
                                className="text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-full px-3 text-sm"
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract & Asset</TableHead>
                  <TableHead>Organizations</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transfers</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Loading contracts...
                    </TableCell>
                  </TableRow>
                ) : contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="flex items-center gap-3 w-full h-full">
                          <Cloud className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{contract.asset.title}</div>
                            <div className="text-xs text-muted-foreground">
                                Contract ID: {contract.id.slice(0, 12)}...
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="block w-full h-full">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">{contract.provider.name}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{contract.consumer.name}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="block w-full h-full">
                          {contract.price > 0 ? (
                            <span className="font-medium">
                              ${contract.price.toLocaleString()} {contract.currency}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Free</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="block w-full h-full">
                          {getStatusBadge(contract.status)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="block w-full h-full">
                          <span className="font-medium">{contract.transferCount}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/contracts/${contract.id}`} className="block w-full h-full">
                          <div className="text-sm">
                            {contract.signedAt ? format(new Date(contract.signedAt), 'MMM d, yyyy') : 'Not signed'}
                          </div>
                          {contract.signedAt && (
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(contract.signedAt), { addSuffix: true })}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No contracts found.
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
                {contracts.length > 0 && (
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
