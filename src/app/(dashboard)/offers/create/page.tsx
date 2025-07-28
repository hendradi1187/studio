
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';

const FormSection = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2">
        <div className="space-y-6">
            {children}
        </div>
      </div>
    </div>
);

const FormField = ({ children, id, label }: { children: React.ReactNode, id: string, label: string }) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
    </div>
);

export default function PublishDataOfferPage() {
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/offers" className="hover:text-foreground">Data Offers</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Publish Data Offer</span>
        </div>

      <div className="space-y-8 max-w-4xl">
        <FormSection 
            title="Data Offer" 
            description="Choose an identifier by which data exchange partners can recognize this data offer">
            <FormField id="data-offer-id" label="Data Offer ID *">
                <Input id="data-offer-id" placeholder="my-data-offer" />
            </FormField>
        </FormSection>

        <FormSection 
            title="Assets" 
            description="Select the assets you want to be published as a data offer">
            <FormField id="assets" label="Assets *">
                 <Select>
                    <SelectTrigger id="assets">
                      <SelectValue placeholder="Select items..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset-1">urn:artifact:my-asset:1.0</SelectItem>
                      <SelectItem value="asset-2">urn:artifact:another-asset:2.1</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
        </FormSection>

        <FormSection 
            title="Policies" 
            description="Select the access and the contract policy for this data offer.The access policy determines which partners will be able to see the offer in your catalogwhile the usage policy determines which partners can consume it">
            <FormField id="access-policy" label="Access Policy *">
                 <Select>
                    <SelectTrigger id="access-policy">
                      <SelectValue placeholder="Select policy..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy-1">my-policy-1</SelectItem>
                      <SelectItem value="policy-2">unrestricted-policy</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
            <FormField id="contract-policy" label="Contract Policy *">
                 <Select>
                    <SelectTrigger id="contract-policy">
                      <SelectValue placeholder="Select policy..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy-1">my-policy-1</SelectItem>
                      <SelectItem value="policy-2">unrestricted-policy</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
        </FormSection>
      </div>

       <div className="flex justify-start pt-4 max-w-4xl">
            <Button>Create Data Offer</Button>
       </div>
    </div>
  );
}
