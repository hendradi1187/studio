
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const FormSection = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6 space-y-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
);

const FormField = ({ label, children }: { label:string, children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
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

      <div className="space-y-8">
        <FormSection 
            title="Data Offer" 
            description="Choose an identifier by which data exchange partners can recognize this data offer">
            <FormField label="Data Offer ID *">
                <Input id="data-offer-id" placeholder="my-data-offer" />
            </FormField>
        </FormSection>

        <FormSection 
            title="Assets" 
            description="Select the assets you want to be published as a data offer">
            <FormField label="Assets *">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select items..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset-1">Asset 1</SelectItem>
                      <SelectItem value="asset-2">Asset 2</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
        </FormSection>

        <FormSection 
            title="Policies" 
            description="Select the access and the contract policy for this data offer. The access policy determines which partners will be able to see the offer in your catalog while the usage policy determines which partners can consume it">
            <FormField label="Access Policy *">
                 <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy-1">Default Policy</SelectItem>
                      <SelectItem value="policy-2">Strict Policy</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
            <FormField label="Contract Policy *">
                 <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="policy-1">Default Policy</SelectItem>
                        <SelectItem value="policy-2">Strict Policy</SelectItem>
                    </SelectContent>
                  </Select>
            </FormField>
        </FormSection>

      </div>

       <div className="flex justify-end pt-4">
            <Button>Create Data Offer</Button>
       </div>
    </div>
  );
}
