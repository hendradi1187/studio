
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getDataOffers } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';

type DataOffer = {
    id: string;
    assetId: string;
    accessPolicy: string;
    contractPolicy: string;
}

export default function DataOffersPage() {
    const [dataOffers, setDataOffers] = React.useState<DataOffer[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        getDataOffers().then(data => setDataOffers(data as DataOffer[]));
    }, []);
    
    const handleDeleteOffer = (offerId: string) => {
        const offerToDelete = dataOffers.find(o => o.id === offerId);
        setDataOffers(dataOffers.filter(o => o.id !== offerId));
        toast({
            title: "Data Offer Deleted",
            description: `The offer "${offerToDelete?.id}" has been removed.`,
            variant: "destructive",
        })
    }


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Offers</h1>
          <p className="text-muted-foreground">Manage your published data offers.</p>
        </div>
        <Button asChild>
          <Link href="/offers/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Data Offer
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Offer ID</TableHead>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Access Policy</TableHead>
                  <TableHead>Contract Policy</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataOffers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No data offers found.
                        </TableCell>
                    </TableRow>
                ) : (
                  dataOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.id}</TableCell>
                      <TableCell className="font-mono text-xs">{offer.assetId}</TableCell>
                      <TableCell>{offer.accessPolicy}</TableCell>
                      <TableCell>{offer.contractPolicy}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/offers/create">Edit</Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                            Delete
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the data offer "{offer.id}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteOffer(offer.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
