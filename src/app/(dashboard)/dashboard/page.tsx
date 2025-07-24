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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  FileJson,
  FileText,
  FileX,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import { datasets, notifications } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const [search, setSearch] = React.useState('');
  const [selectedDataset, setSelectedDataset] = React.useState<(typeof datasets)[0] | null>(null);

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.title.toLowerCase().includes(search.toLowerCase()) ||
      dataset.institution.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="secondary">Open</Badge>;
      case 'Restricted':
        return <Badge variant="destructive">Restricted</Badge>;
      case 'By Request':
        return <Badge variant="outline">By Request</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dataset Catalog</CardTitle>
            <CardDescription>
              Browse, search, and filter available datasets from all connected sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, institution, keyword..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>Open</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Restricted</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>By Request</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((dataset) => (
                     <Dialog key={dataset.id} onOpenChange={(open) => !open && setSelectedDataset(null)}>
                      <DialogTrigger asChild>
                        <TableRow className="cursor-pointer" onClick={() => setSelectedDataset(dataset)}>
                          <TableCell className="font-medium">{dataset.title}</TableCell>
                          <TableCell>{dataset.institution}</TableCell>
                          <TableCell>{dataset.date}</TableCell>
                          <TableCell>{getStatusBadge(dataset.accessStatus)}</TableCell>
                        </TableRow>
                      </DialogTrigger>
                    </Dialog>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Notifications</CardTitle>
            <CardDescription>Recent data requests and approvals.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${notification.read ? "bg-muted-foreground" : "bg-accent"}`} />
                  <div>
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedDataset && (
           <Dialog open={!!selectedDataset} onOpenChange={(open) => !open && setSelectedDataset(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedDataset.title}</DialogTitle>
                <DialogDescription>{selectedDataset.institution} - {selectedDataset.date}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Abstract</h4>
                  <p className="text-sm text-muted-foreground">{selectedDataset.abstract}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Structure</h4>
                  <p className="text-sm text-muted-foreground">{selectedDataset.structure}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">File Formats</h4>
                  <p className="text-sm text-muted-foreground">{selectedDataset.format}</p>
                </div>
                 <div>
                  <h4 className="font-semibold mb-2">Download Metadata</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><FileJson className="mr-2 h-4 w-4"/> JSON</Button>
                    <Button variant="outline" size="sm"><FileX className="mr-2 h-4 w-4"/> XML</Button>
                    <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4"/> XLS</Button>
                  </div>
                </div>
              </div>
               <div className="pt-4 border-t">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Download className="mr-2 h-4 w-4"/>
                    Request Access to Dataset
                  </Button>
               </div>
            </DialogContent>
           </Dialog>
        )}
      </div>
    </div>
  );
}
