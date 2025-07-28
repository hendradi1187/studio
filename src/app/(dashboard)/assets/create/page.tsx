
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight, PlusCircle, Info } from 'lucide-react';

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

const FormField = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
);

const LabelWithInfo = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <div className="flex items-center">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Info className="h-3 w-3 ml-1.5 text-muted-foreground" />
  </div>
)

const CheckboxWithLabel = ({ id, label, description }: { id: string, label: string, description: string }) => (
    <div className="flex items-start gap-4">
        <Checkbox id={id} className="mt-1" />
        <div className="grid gap-1.5 leading-none">
            <label
                htmlFor={id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
            </label>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    </div>
)


export default function NewAssetPage() {
  const [offerType, setOfferType] = React.useState('available');

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/assets" className="hover:text-foreground">Assets</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">New Asset</span>
        </div>

      <div className="space-y-8">
        <FormSection title="Data offer type" description="Define the type of your offer">
            <FormField>
                <Label>Offer Type</Label>
                <RadioGroup value={offerType} onValueChange={setOfferType}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="available" id="available" />
                        <Label htmlFor="available">Available (with data source)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on-request" id="on-request" />
                        <Label htmlFor="on-request">On Request (without data source)</Label>
                    </div>
                </RadioGroup>
            </FormField>

            {offerType === 'available' && (
                <>
                <FormField>
                  <Label htmlFor="type">Type</Label>
                  <Select defaultValue="rest-api">
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest-api">REST-API Endpoint</SelectItem>
                      <SelectItem value="custom">Custom Datasource</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <Label htmlFor="method">Method</Label>
                   <Select defaultValue="get">
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="get">GET</SelectItem>
                      <SelectItem value="post">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <LabelWithInfo htmlFor="url">URL *</LabelWithInfo>
                  <Input id="url" placeholder="https://my-data-source.com/api" />
                </FormField>

                <FormField>
                  <Label>Query Params</Label>
                  <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Pair</Button>
                </FormField>

                <FormField>
                  <Label htmlFor="auth">Authentication</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="auth">
                      <SelectValue placeholder="Select authentication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="header-value">Header with Value</SelectItem>
                      <SelectItem value="header-vault">Header with Vault Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                 <FormField>
                  <Label>Additional Headers</Label>
                  <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Pair</Button>
                </FormField>
              </>
            )}
        </FormSection>

        <FormSection title="General Information" description="Provide metadata for your asset.">
            <FormField>
                <LabelWithInfo htmlFor="title">Title *</LabelWithInfo>
                <Input id="title" placeholder="My Asset" />
            </FormField>
            
            <FormField>
                <LabelWithInfo htmlFor="asset-id">Asset ID *</LabelWithInfo>
                <Input id="asset-id" placeholder="urn:artifact:my-asset:1.0" />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="description">Description</LabelWithInfo>
                <Textarea id="description" placeholder="# My Asset..." />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="keywords">Keywords</LabelWithInfo>
                <Input id="keywords" placeholder="Add keyword..." />
            </FormField>

             <FormField>
                <LabelWithInfo htmlFor="version">Version</LabelWithInfo>
                <Input id="version" placeholder="1.0" />
            </FormField>
            
             <FormField>
                <LabelWithInfo htmlFor="language">Language</LabelWithInfo>
                <Input id="language" placeholder="English" />
            </FormField>
            
             <FormField>
                <LabelWithInfo htmlFor="content-type">Content Type</LabelWithInfo>
                <Input id="content-type" placeholder="application/json" />
            </FormField>

            <div className="flex items-center space-x-2">
                <Checkbox id="advanced-fields" />
                <label
                    htmlFor="advanced-fields"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Show Advanced Fields
                </label>
            </div>
        </FormSection>
      </div>

       <div className="flex justify-end pt-4 gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create</Button>
       </div>
    </div>
  );
}
