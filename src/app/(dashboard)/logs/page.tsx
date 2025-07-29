
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Info, 
    Cloud, 
    ArrowRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockTransfers = [
    {
        id: '0197f356-3cce-722f-b83b-0c83a3099b2e',
        contractId: 'demotest',
        provider: 'provider',
        consumer: 'You',
        state: 'STARTED',
        lastUpdated: '19 seconds ago',
    },
    {
        id: '0197f353-a21a-7eef-bd77-a82ceea2b74c',
        contractId: 'demotest',
        provider: 'provider',
        consumer: 'You',
        state: 'STARTED',
        lastUpdated: '3 minutes ago',
    }
]

export default function TransferHistoryPage() {

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Transfer History</h1>
      <Card>
        <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-10"
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                         <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Transfer Process ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                         <div className="flex items-center gap-3">
                          <Cloud className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transfer.contractId}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                                <span>{transfer.provider}</span>
                                <ArrowRight className="h-3 w-3 mx-1" />
                                <span>{transfer.consumer}</span>
                            </div>
                          </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{transfer.state}</Badge>
                    </TableCell>
                    <TableCell>{transfer.lastUpdated}</TableCell>
                    <TableCell className="font-mono text-xs">{transfer.id}</TableCell>
                  </TableRow>
                ))}
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
              <span>1-2 of 2 results</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
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
