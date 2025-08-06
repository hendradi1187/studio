
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
import { ChevronRight, Info } from 'lucide-react';

const FormSection = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2">
        <Card>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {children}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
);

const FormField = ({ children, id, label, required = false }: { children: React.ReactNode, id: string, label: string, required?: boolean }) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}{required && ' *'}</Label>
        {children}
    </div>
);

export default function RegisterConnectorPage() {
    const [authMethod, setAuthMethod] = React.useState('none');

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/broker" className="hover:text-foreground">Connector Status</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Register Connector</span>
        </div>

        <h1 className="text-3xl font-bold">Register New Connector</h1>

        <div className="space-y-8 max-w-4xl">
            <FormSection 
                title="Connector Details" 
                description="Provide the basic information for the new connector.">
                <FormField id="connector-name" label="Connector Name" required>
                    <Input id="connector-name" placeholder="e.g., Alpha Oil & Gas Connector" />
                </FormField>
                <FormField id="connector-endpoint" label="Connector Endpoint URL" required>
                    <Input id="connector-endpoint" placeholder="https://connector.example.com/api/dsp" />
                </FormField>
            </FormSection>

            <FormSection 
                title="Authentication" 
                description="Configure how to authenticate with the connector's endpoint.">
                <FormField id="auth-method" label="Authentication Method">
                    <Select value={authMethod} onValueChange={setAuthMethod}>
                        <SelectTrigger id="auth-method">
                        <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>

                {authMethod === 'api-key' && (
                    <>
                        <FormField id="api-key-header" label="API Key Header Name" required>
                            <Input id="api-key-header" placeholder="e.g., X-API-KEY" />
                        </FormField>
                        <FormField id="api-key-value" label="API Key Value" required>
                            <Input id="api-key-value" type="password" placeholder="Enter secret key..." />
                        </FormField>
                    </>
                )}
            </FormSection>
      </div>

       <div className="flex justify-start pt-4 gap-2 max-w-4xl">
            <Button variant="outline">Cancel</Button>
            <Button>Register Connector</Button>
       </div>
    </div>
  );
}

