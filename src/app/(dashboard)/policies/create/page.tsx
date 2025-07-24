
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
import { ChevronRight, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


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


export default function CreatePolicyPage() {

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/policies" className="hover:text-foreground">Policies</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">New Policy</span>
        </div>

      <div className="space-y-8">
        <FormSection title="General" description="General Information">
            <FormField>
                <Label htmlFor="policy-id">Policy Definition ID *</Label>
                <Input id="policy-id" placeholder="my-policy-1" />
            </FormField>
        </FormSection>

        <FormSection title="Policy Expression" description="Restricts Negotiations or Transfers">
            <FormField>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>AND</DropdownMenuItem>
                        <DropdownMenuItem>OR</DropdownMenuItem>
                        <DropdownMenuItem>XONE</DropdownMenuItem>
                        <DropdownMenuItem>Consumer's Participant ID</DropdownMenuItem>
                        <DropdownMenuItem>Time Restriction</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </FormField>
        </FormSection>

      </div>

       <div className="flex justify-end pt-4">
            <Button>Create Policy</Button>
       </div>
    </div>
  );
}
