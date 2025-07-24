'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Download, Search } from 'lucide-react';
import { transactionLogs } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LogsPage() {
  const [search, setSearch] = React.useState('');

  const filteredLogs = transactionLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Success</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Logs</h1>
          <p className="text-muted-foreground">
            Audit trail of all user and system interactions with data.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, details..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
            </Select>
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="request">Request Access</SelectItem>
                    <SelectItem value="sync">Sync Metadata</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
