
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { ChevronRight, PlusCircle, Info, File, Settings, ChevronLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


const steps = [
  { id: '01', name: 'Offer Type', icon: File },
  { id: '02', name: 'Data Source', icon: Settings },
  { id: '03', name: 'General Information', icon: Info },
];

const FormField = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
);

const LabelWithInfo = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <div className="flex items-center">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Info className="h-3 w-3 ml-1.5 text-muted-foreground" />
  </div>
)

const Step1_OfferType = ({ offerType, setOfferType }: { offerType: string, setOfferType: (value: string) => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Data Offer Type</CardTitle>
            <CardDescription>Define the type of your offer. This will determine the next steps.</CardDescription>
        </CardHeader>
        <CardContent>
             <FormField>
                <RadioGroup value={offerType} onValueChange={setOfferType} className="gap-4">
                    <Label htmlFor="available" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                        <RadioGroupItem value="available" id="available" />
                        <div>
                             <p className="font-medium">Available (with data source)</p>
                             <p className="text-sm text-muted-foreground">The data is directly accessible via an endpoint.</p>
                        </div>
                    </Label>
                    <Label htmlFor="on-request" className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                        <RadioGroupItem value="on-request" id="on-request" />
                         <div>
                             <p className="font-medium">On Request (without data source)</p>
                             <p className="text-sm text-muted-foreground">The data will be provided after a negotiation process.</p>
                        </div>
                    </Label>
                </RadioGroup>
            </FormField>
        </CardContent>
    </Card>
);

const Step2_DataSource = ({ 
    type, setType, 
    method, setMethod, 
    url, setUrl, 
    auth, setAuth 
}: {
    type: string; setType: (v: string) => void;
    method: string; setMethod: (v: string) => void;
    url: string; setUrl: (v: string) => void;
    auth: string; setAuth: (v: string) => void;
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Data Source Configuration</CardTitle>
            <CardDescription>Provide the technical details for accessing the data source.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <FormField>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
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
                <Select value={method} onValueChange={setMethod}>
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
                <Input id="url" placeholder="https://my-data-source.com/api" value={url} onChange={(e) => setUrl(e.target.value)} />
            </FormField>

            <FormField>
                <Label>Query Params</Label>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Pair</Button>
            </FormField>

            <FormField>
                <Label htmlFor="auth">Authentication</Label>
                <Select value={auth} onValueChange={setAuth}>
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
        </CardContent>
    </Card>
);

const Step3_GeneralInfo = ({
    title, setTitle,
    assetId, setAssetId,
    description, setDescription,
    keywords, setKeywords,
    version, setVersion,
    language, setLanguage,
    contentType, setContentType,
}: {
    title: string; setTitle: (v: string) => void;
    assetId: string; setAssetId: (v: string) => void;
    description: string; setDescription: (v: string) => void;
    keywords: string; setKeywords: (v: string) => void;
    version: string; setVersion: (v: string) => void;
    language: string; setLanguage: (v: string) => void;
    contentType: string; setContentType: (v: string) => void;
}) => (
    <Card>
        <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Provide metadata for your asset. This information will be visible to others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <FormField>
                <LabelWithInfo htmlFor="title">Title *</LabelWithInfo>
                <Input id="title" placeholder="e.g., Well Log Data for Block C" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            
            <FormField>
                <LabelWithInfo htmlFor="asset-id">Asset ID *</LabelWithInfo>
                <Input id="asset-id" placeholder="urn:artifact:my-asset:1.0" value={assetId} onChange={(e) => setAssetId(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="description">Description</LabelWithInfo>
                <Textarea id="description" placeholder="A brief summary of the asset, its contents, and purpose." value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="keywords">Keywords</LabelWithInfo>
                <Input id="keywords" placeholder="e.g., Seismic, Well Log, Geochemistry" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="version">Version</LabelWithInfo>
                <Input id="version" placeholder="1.0.0" value={version} onChange={(e) => setVersion(e.target.value)} />
            </FormField>
            
            <FormField>
                <LabelWithInfo htmlFor="language">Language</LabelWithInfo>
                <Input id="language" placeholder="English" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </FormField>
            
            <FormField>
                <LabelWithInfo htmlFor="content-type">Content Type</LabelWithInfo>
                <Input id="content-type" placeholder="application/json" value={contentType} onChange={(e) => setContentType(e.target.value)} />
            </FormField>
        </CardContent>
    </Card>
);


export default function NewAssetPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  
  // Step 1 State
  const [offerType, setOfferType] = React.useState('available');

  // Step 2 State
  const [dataSourceType, setDataSourceType] = React.useState('rest-api');
  const [dataSourceMethod, setDataSourceMethod] = React.useState('get');
  const [dataSourceUrl, setDataSourceUrl] = React.useState('');
  const [dataSourceAuth, setDataSourceAuth] = React.useState('none');

  // Step 3 State
  const [title, setTitle] = React.useState('');
  const [assetId, setAssetId] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [version, setVersion] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [contentType, setContentType] = React.useState('');


  const finalStepIndex = offerType === 'available' ? steps.length - 1 : steps.length - 2;

  const handleNext = () => {
    if (currentStep < finalStepIndex) {
        // Skip step 2 if offer type is 'on-request'
        if (currentStep === 0 && offerType === 'on-request') {
             setCurrentStep(currentStep + 2);
        } else {
            setCurrentStep(currentStep + 1);
        }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
        // Handle jumping back from step 3 to 1 if offer type was 'on-request'
         if (currentStep === 2 && offerType === 'on-request') {
             setCurrentStep(currentStep - 2);
        } else {
            setCurrentStep(currentStep - 1);
        }
    }
  };

  const StepIndicator = () => (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          if (offerType === 'on-request' && step.name === 'Data Source') return null;

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Create New Asset</h1>
        <p className="text-muted-foreground">Follow the steps to define and publish a new data asset.</p>
      </div>
      
      <StepIndicator />

      <div className="mt-8">
        {currentStep === 0 && <Step1_OfferType offerType={offerType} setOfferType={setOfferType} />}
        {currentStep === 1 && offerType === 'available' && <Step2_DataSource 
            type={dataSourceType} setType={setDataSourceType}
            method={dataSourceMethod} setMethod={setDataSourceMethod}
            url={dataSourceUrl} setUrl={setDataSourceUrl}
            auth={dataSourceAuth} setAuth={setDataSourceAuth}
        />}
        {currentStep === 2 && <Step3_GeneralInfo
            title={title} setTitle={setTitle}
            assetId={assetId} setAssetId={setAssetId}
            description={description} setDescription={setDescription}
            keywords={keywords} setKeywords={setKeywords}
            version={version} setVersion={setVersion}
            language={language} setLanguage={setLanguage}
            contentType={contentType} setContentType={setContentType}
        />}
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
                 {currentStep < finalStepIndex ? (
                    <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                 ) : (
                    <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Asset
                    </Button>
                 )}
            </div>
       </div>
    </div>
  );
}
