
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { ChevronRight, CheckCircle, ChevronLeft, FileSignature, Database, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: '01', name: 'Offer Details', icon: FileSignature },
  { id: '02', name: 'Select Assets', icon: Database },
  { id: '03', name: 'Define Policies', icon: ShieldCheck },
];

const FormField = ({ children, id, label, required = false }: { children: React.ReactNode, id: string, label: string, required?: boolean }) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}{required && ' *'}</Label>
        {children}
    </div>
);

const Step1_OfferDetails = () => (
    <Card>
        <CardHeader>
            <CardTitle>Data Offer Details</CardTitle>
            <CardDescription>Choose an identifier by which data exchange partners can recognize this data offer.</CardDescription>
        </CardHeader>
        <CardContent>
            <FormField id="data-offer-id" label="Data Offer ID" required>
                <Input id="data-offer-id" placeholder="e.g., my-seismic-data-offer-q1" />
            </FormField>
        </CardContent>
    </Card>
);

const Step2_SelectAssets = () => (
    <Card>
        <CardHeader>
            <CardTitle>Select Assets</CardTitle>
            <CardDescription>Select the assets you want to publish as part of this data offer.</CardDescription>
        </CardHeader>
        <CardContent>
            <FormField id="assets" label="Assets" required>
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
        </CardContent>
    </Card>
);

const Step3_DefinePolicies = () => (
    <Card>
        <CardHeader>
            <CardTitle>Define Policies</CardTitle>
            <CardDescription>Select the access and contract policies. Access policy determines who can see the offer, while usage policy determines who can consume it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <FormField id="access-policy" label="Access Policy" required>
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
            <FormField id="contract-policy" label="Contract Policy" required>
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
        </CardContent>
    </Card>
);


export default function PublishDataOfferPage() {
    const [currentStep, setCurrentStep] = React.useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const StepIndicator = () => (
        <nav aria-label="Progress">
          <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
            {steps.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              
              return (
                <li key={step.name} className="md:flex-1">
                    <div
                      className={cn(
                        'group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0',
                        isCompleted ? 'border-primary' : (isCurrent ? 'border-primary' : 'border-border'),
                      )}
                    >
                      <span className={cn('text-sm font-medium', isCompleted ? 'text-primary' : (isCurrent ? 'text-primary' : 'text-muted-foreground'))}>
                        {step.id}
                      </span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                </li>
              )
            })}
          </ol>
        </nav>
      );

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/offers" className="hover:text-foreground">Data Offers</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Publish Data Offer</span>
            </div>
            <h1 className="text-3xl font-bold">Publish New Data Offer</h1>
            <p className="text-muted-foreground">Follow the steps to publish a new data offer.</p>
        </div>
      
        <StepIndicator />

        <div className="mt-8">
            {currentStep === 0 && <Step1_OfferDetails />}
            {currentStep === 1 && <Step2_SelectAssets />}
            {currentStep === 2 && <Step3_DefinePolicies />}
        </div>
        
        <div className="flex justify-between pt-4 gap-2">
            <div>
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
              )}
            </div>
            <div>
                 {currentStep < steps.length - 1 ? (
                    <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                 ) : (
                    <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Data Offer
                    </Button>
                 )}
            </div>
       </div>
    </div>
  );
}
