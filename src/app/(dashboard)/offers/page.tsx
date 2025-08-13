
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
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
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDataOffers, deleteDataOffer } from '@/lib/api';
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
    assetTitle: string;
    assetDescription?: string;
    accessPolicyId?: string;
    accessPolicyName?: string;
    contractPolicyId?: string;
    contractPolicyName?: string;
    price?: number;
    currency: string;
    validUntil?: string;
    status: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    providerOrganization?: string;
}

export default function DataOffersPage() {
    const [dataOffers, setDataOffers] = React.useState<DataOffer[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        fetchDataOffers();
    }, []);

    const fetchDataOffers = async () => {
        setIsLoading(true);
        try {
            const response = await getDataOffers();
            setDataOffers(response.dataOffers || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not fetch data offers.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteOffer = async (offerId: string) => {
        const offerToDelete = dataOffers.find(o => o.id === offerId);
        if (!offerToDelete) return;
        
        try {
            await deleteDataOffer(offerId);
            setDataOffers(dataOffers.filter(o => o.id !== offerId));
            toast({
                title: "Data Offer Deleted",
                description: `The offer for "${offerToDelete?.assetTitle}" has been removed.`,
            })
        } catch (error) {
             toast({
                title: "Error",
                description: `Could not delete data offer for "${offerToDelete?.assetTitle}".`,
                variant: "destructive",
            });
        }
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
                  <TableHead>Asset</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Access Policy</TableHead>
                  <TableHead>Contract Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : dataOffers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                            No data offers found.
                        </TableCell>
                    </TableRow>
                ) : (
                  dataOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{offer.assetTitle}</div>
                          {offer.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {offer.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {offer.price ? (
                          <span className="font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: offer.currency || 'USD'
                            }).format(offer.price)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Free</span>
                        )}
                      </TableCell>
                      <TableCell>{offer.accessPolicyName || '-'}</TableCell>
                      <TableCell>{offer.contractPolicyName || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          offer.status === 'active' ? 'bg-green-100 text-green-800' : 
                          offer.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {offer.validUntil ? (
                          <span className="text-sm">
                            {new Date(offer.validUntil).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{offer.providerOrganization || '-'}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
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
                                        <Link href={`/offers/create?edit=${offer.id}`}>Edit</Link>
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                            Delete
                                        </button>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the data offer for "{offer.assetTitle}".
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
