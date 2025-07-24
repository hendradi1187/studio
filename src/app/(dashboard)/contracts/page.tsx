
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"


const mockContracts = [
  {
    id: 'demotest',
    provider: 'provider',
    consumer: 'You',
    signedAt: 'Signed 1 minute ago',
    terminatedAt: 'Ongoing',
    transfers: 0,
  },
];

const FilterToggle = ({ options, defaultValue }: { options: string[], defaultValue: string }) => (
    <ToggleGroup type="single" defaultValue={defaultValue} className="border rounded-md bg-background h-10 p-1">
        {options.map(option => (
             <ToggleGroupItem 
                key={option} 
                value={option.toLowerCase()}
                className="text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-full px-3 text-sm"
            >
                {option}
            </ToggleGroupItem>
        ))}
    </ToggleGroup>
)


export default function ContractsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Contracts</h1>

      <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                    <FilterToggle options={['All', 'Active', 'Terminated']} defaultValue="active"/>
                    <FilterToggle options={['All', 'Providing', 'Consuming']} defaultValue="all"/>
                </div>
            </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Signed At</TableHead>
                  <TableHead>Terminated At</TableHead>
                  <TableHead>Transfers</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContracts.length > 0 ? (
                  mockContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Cloud className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{contract.id}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                                <span>{contract.provider}</span>
                                <ArrowRight className="h-3 w-3 mx-1" />
                                <span>{contract.consumer}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{contract.signedAt}</TableCell>
                      <TableCell>{contract.terminatedAt}</TableCell>
                      <TableCell>{contract.transfers}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
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
              <span>1-1 of 1 results</span>
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
