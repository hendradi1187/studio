
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

const dataOffers = [
   {
    id: 'my-data-offer',
    assetId: 'urn:artifact:my-asset:1.0',
    accessPolicy: 'my-policy-1',
    contractPolicy: 'my-policy-1',
  }
];

export default function DataOffersPage() {
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
                      <TableCell>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
