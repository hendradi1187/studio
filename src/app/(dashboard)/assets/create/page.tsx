
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
import { ChevronRight, PlusCircle, Info, File, Settings, ChevronLeft, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { createAsset, getAssets } from '@/lib/api';
import FileUpload from '@/components/file-upload';

type UploadedFile = {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  category: string;
  path: string;
  uploadedAt: string;
};


const steps = [
  { id: '01', name: 'Offer Type', icon: File },
  { id: '02', name: 'Data Source', icon: Settings },
  { id: '03', name: 'General Information', icon: Info },
  { id: '04', name: 'File Upload', icon: Upload },
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
    description, setDescription,
    keywords, setKeywords,
    version, setVersion,
    geographicArea, setGeographicArea,
    accessStatus, setAccessStatus,
    abstract, setAbstract,
}: {
    title: string; setTitle: (v: string) => void;
    description: string; setDescription: (v: string) => void;
    keywords: string; setKeywords: (v: string) => void;
    version: string; setVersion: (v: string) => void;
    geographicArea: string; setGeographicArea: (v: string) => void;
    accessStatus: string; setAccessStatus: (v: string) => void;
    abstract: string; setAbstract: (v: string) => void;
}) => (
    <Card>
        <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Provide metadata for your asset. This information will be visible to others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <FormField>
                <LabelWithInfo htmlFor="title">Title *</LabelWithInfo>
                <Input id="title" placeholder="e.g., Seismic Survey Block A-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="description">Description</LabelWithInfo>
                <Textarea id="description" placeholder="A brief summary of the asset, its contents, and purpose." value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="abstract">Abstract</LabelWithInfo>
                <Textarea id="abstract" placeholder="Detailed technical description of the data asset." value={abstract} onChange={(e) => setAbstract(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="keywords">Keywords</LabelWithInfo>
                <Input id="keywords" placeholder="e.g., seismic, 3D, exploration, survey" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </FormField>

            <FormField>
                <LabelWithInfo htmlFor="geographic-area">Geographic Area</LabelWithInfo>
                <Input id="geographic-area" placeholder="e.g., East Java Basin, Natuna Sea" value={geographicArea} onChange={(e) => setGeographicArea(e.target.value)} />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                    <LabelWithInfo htmlFor="version">Version</LabelWithInfo>
                    <Input id="version" placeholder="1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
                </FormField>
                
                <FormField>
                    <LabelWithInfo htmlFor="access-status">Access Status</LabelWithInfo>
                    <Select value={accessStatus} onValueChange={setAccessStatus}>
                        <SelectTrigger id="access-status">
                            <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open - Public access</SelectItem>
                            <SelectItem value="restricted">Restricted - Limited access</SelectItem>
                            <SelectItem value="by_request">By Request - Approval required</SelectItem>
                            <SelectItem value="private">Private - Owner only</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
            </div>
        </CardContent>
    </Card>
);

const Step4_FileUpload = ({
    uploadedFiles, setUploadedFiles,
    category, setCategory
}: {
    uploadedFiles: UploadedFile[];
    setUploadedFiles: (files: UploadedFile[]) => void;
    category: string;
    setCategory: (category: string) => void;
}) => (
    <Card>
        <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Upload data files for your asset. Supported formats include SEG-Y, LAS, CSV, Excel, PDF, and more.</CardDescription>
        </CardHeader>
        <CardContent>
            <FileUpload
                onFileUploaded={(file) => setUploadedFiles([...uploadedFiles, file])}
                onFileRemoved={(fileName) => setUploadedFiles(uploadedFiles.filter(f => f.fileName !== fileName))}
                category={category as any}
                allowCategorySelection={true}
                maxFiles={10}
                maxSize={100 * 1024 * 1024 * 1024} // 100GB
            />
        </CardContent>
    </Card>
);


export default function NewAssetPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  // Step 1 State
  const [offerType, setOfferType] = React.useState('available');

  // Step 2 State
  const [dataSourceType, setDataSourceType] = React.useState('rest-api');
  const [dataSourceMethod, setDataSourceMethod] = React.useState('get');
  const [dataSourceUrl, setDataSourceUrl] = React.useState('');
  const [dataSourceAuth, setDataSourceAuth] = React.useState('none');

  // Step 3 State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [abstract, setAbstract] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [version, setVersion] = React.useState('1.0');
  const [geographicArea, setGeographicArea] = React.useState('');
  const [accessStatus, setAccessStatus] = React.useState('private');

  // Step 4 State
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [fileCategory, setFileCategory] = React.useState('other');

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Asset title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total file size
      const totalFileSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      const mainFile = uploadedFiles[0]; // Use first uploaded file as main file
      
      // Determine data format from uploaded files
      const formats = uploadedFiles.map(file => {
        const ext = file.originalName.toLowerCase().split('.').pop();
        if (ext === 'sgy' || ext === 'segy') return '.sgy';
        if (ext === 'las') return '.las';
        if (ext === 'csv') return '.csv';
        if (ext === 'xlsx') return '.xlsx';
        if (ext === 'pdf') return '.pdf';
        return file.type;
      });
      
      const assetData = {
        title: title.trim(),
        description: description.trim(),
        abstract: abstract.trim(),
        keywords: keywords.trim(),
        geographicArea: geographicArea.trim(),
        accessStatus,
        version: version || '1.0',
        dataFormat: formats.join(', '),
        fileSize: totalFileSize,
        filePath: mainFile?.path,
        category: fileCategory,
        dataStructure: uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.originalName).join(', ')}` : undefined,
      };

      const result = await createAsset(assetData);
      
      toast({
        title: "Asset Created",
        description: `Asset "${title}" has been created successfully.`,
      });
      
      // Redirect to assets list
      router.push('/assets');
      
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            description={description} setDescription={setDescription}
            abstract={abstract} setAbstract={setAbstract}
            keywords={keywords} setKeywords={setKeywords}
            version={version} setVersion={setVersion}
            geographicArea={geographicArea} setGeographicArea={setGeographicArea}
            accessStatus={accessStatus} setAccessStatus={setAccessStatus}
        />}
        {currentStep === 3 && <Step4_FileUpload
            uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
            category={fileCategory} setCategory={setFileCategory}
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
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                 ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? 'Creating...' : 'Create Asset'}
                    </Button>
                 )}
            </div>
       </div>
    </div>
  );
}
