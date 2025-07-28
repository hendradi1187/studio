
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
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
  Search,
  Database,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const mockOffers = [
  {
    id: 'demotest',
    name: 'DemoTest',
    description: 'Demo Description',
    version: '1.0',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    policy: 'unrestricted',
    provider: 'provider',
  },
];

export default function CatalogBrowserPage() {
    const { toast } = useToast();

    const handleNegotiate = () => {
        toast({
            title: "Contract Negotiation Started",
            description: "You will be notified when the process is complete.",
        })
    }
  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h1 className="text-3xl font-bold">Catalog Browser</h1>
            <p className="text-muted-foreground">Find and consume data from other connectors.</p>
        </div>
      <Card>
        <CardHeader>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Input
                        id="connector-endpoint"
                        placeholder="Enter another Connector's Endpoint URL..."
                        className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                         <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <div className="relative w-full md:w-auto md:min-w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search within catalog..." className="pl-10" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Offer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOffers.length > 0 ? (
                  mockOffers.map((offer) => (
                    <TableRow key={offer.id} className="cursor-pointer">
                        <TableCell className="w-1/3">
                          <Link href={`/catalog/${offer.provider}/${offer.id}`} className="flex items-center gap-3 hover:text-primary">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{offer.name}</div>
                                <div className="text-xs text-muted-foreground">{offer.id}</div>
                            </div>
                           </Link>
                        </TableCell>
                       <TableCell>
                         <Link href={`/catalog/${offer.provider}/${offer.id}`} className="block w-full h-full">
                           {offer.description}
                         </Link>
                       </TableCell>

                      <TableCell className="text-right">
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="outline" size="sm">Negotiate</Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Negotiate Contract for "{offer.name}"</AlertDialogTitle>
                            <AlertDialogDescription>
                                Review the terms and conditions before proceeding.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-4">
                                 <p className="text-sm"><strong>Standard License:</strong> <a href={offer.license} target="_blank" rel="noopener noreferrer" className="text-primary underline">{offer.license}</a></p>
                                 <p className="text-sm"><strong>Policy:</strong> {offer.policy}</p>
                                 <div className="flex items-center space-x-2 pt-4">
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms" className="text-sm font-normal">I agree to the Data Offer Terms & Conditions</Label>
                                </div>
                            </div>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleNegotiate}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                         </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No offers found. Enter a Connector Endpoint to start.
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
