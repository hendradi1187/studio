
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerConnector } from '@/lib/api';

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
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const [name, setName] = React.useState('');
    const [endpoint, setEndpoint] = React.useState('');
    const [authMethod, setAuthMethod] = React.useState('none');
    const [apiKeyHeader, setApiKeyHeader] = React.useState('');
    const [apiKeyValue, setApiKeyValue] = React.useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const connectorData = {
            name,
            endpoint,
            auth: {
                method: authMethod,
                header: authMethod === 'api-key' ? apiKeyHeader : undefined,
                key: authMethod === 'api-key' ? apiKeyValue : undefined,
            },
        };

        try {
            await registerConnector(connectorData);
            toast({
                title: "Connector Registered!",
                description: `The connector "${name}" has been successfully registered.`,
            });
            router.push('/broker');
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: "Could not register the connector. Please check the details and try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
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
                    <Input id="connector-name" placeholder="e.g., Alpha Oil & Gas Connector" value={name} onChange={e => setName(e.target.value)} required />
                </FormField>
                <FormField id="connector-endpoint" label="Connector Endpoint URL" required>
                    <Input id="connector-endpoint" placeholder="https://connector.example.com/api/dsp" value={endpoint} onChange={e => setEndpoint(e.target.value)} required />
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
                            <Input id="api-key-header" placeholder="e.g., X-API-KEY" value={apiKeyHeader} onChange={e => setApiKeyHeader(e.target.value)} required={authMethod === 'api-key'} />
                        </FormField>
                        <FormField id="api-key-value" label="API Key Value" required>
                            <Input id="api-key-value" type="password" placeholder="Enter secret key..." value={apiKeyValue} onChange={e => setApiKeyValue(e.target.value)} required={authMethod === 'api-key'} />
                        </FormField>
                    </>
                )}
            </FormSection>
      </div>

       <div className="flex justify-start pt-4 gap-2 max-w-4xl">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Connector
            </Button>
       </div>
    </form>
  );
}
