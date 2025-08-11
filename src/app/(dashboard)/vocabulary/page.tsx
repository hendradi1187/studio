
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Search, FileUp, ChevronsRight, Loader2 } from 'lucide-react';
import { getVocabulary, addVocabularyTerm } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type VocabItem = {
  term: string;
  children?: VocabItem[];
};

const VocabularyList: React.FC<{ items: VocabItem[] }> = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">No vocabulary terms found.</p>;
  }

  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="font-code hover:no-underline">
            {item.term}
          </AccordionTrigger>
          <AccordionContent>
            {item.children && item.children.length > 0 ? (
              <div className="pl-4 border-l">
                <VocabularyList items={item.children} />
              </div>
            ) : (
              <p className="text-muted-foreground italic pl-4">No sub-terms.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [vocabulary, setVocabulary] = React.useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddTermOpen, setIsAddTermOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchVocabulary = async () => {
    setIsLoading(true);
    try {
        const data = await getVocabulary();
        setVocabulary(data);
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not fetch vocabulary.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchVocabulary();
  }, []);

  const handleAddTerm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const term = formData.get('term') as string;
    const parentTerm = formData.get('parent-term') as string;

    try {
        await addVocabularyTerm({ term, parent: parentTerm === 'none' ? undefined : parentTerm });
        toast({
            title: "Term Added!",
            description: `The term "${term}" has been successfully added.`,
        });
        setIsAddTermOpen(false);
        fetchVocabulary(); // Refetch to show the new term
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not add the new term.",
            variant: "destructive",
        });
    }
  }

  const handleUploadFile = () => {
    toast({
        title: "File Uploaded!",
        description: "The vocabulary file has been uploaded for processing.",
    });
    setIsUploadOpen(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary Provider</h1>
          <p className="text-muted-foreground">
            Manage standardized vocabulary for consistent data searching.
          </p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Vocabulary File</DialogTitle>
                    <DialogDescription>
                        Select a file in JSON or CSV format containing your vocabulary terms.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="vocab-file">Vocabulary File</Label>
                    <Input id="vocab-file" type="file" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                    <Button onClick={handleUploadFile}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
                <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Term
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Term</DialogTitle>
                        <DialogDescription>
                           Enter the details for the new vocabulary term.
                        </DialogDescription>
                    </DialogHeader>
                    <form id="add-term-form" onSubmit={handleAddTerm}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="term">Term</Label>
                                <Input id="term" name="term" placeholder="e.g., Wellbore" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent-term">Parent Term (Optional)</Label>
                                 <Select name="parent-term" defaultValue="none">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a parent term" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None (Root Level)</SelectItem>
                                    <SelectItem value="Seismic">Seismic</SelectItem>
                                    <SelectItem value="Well (Sumur)">Well (Sumur)</SelectItem>
                                    <SelectItem value="Field (Lapangan)">Field (Lapangan)</SelectItem>
                                    <SelectItem value="Facilities">Facilities</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTermOpen(false)}>Cancel</Button>
                        <Button type="submit" form="add-term-form">Save Term</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Vocabulary Hierarchy</CardTitle>
                    <CardDescription>
                        Browse and manage the hierarchical list of controlled terms.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <VocabularyList items={vocabulary} />
                    )}
                </CardContent>
            </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI-Assisted Search</CardTitle>
              <CardDescription>
                Test the autocomplete and synonym mapping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type 'Well' or 'Seismic'..."
                  className="pl-10 font-code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm">Suggestions</h4>
                    <div className="font-code text-sm flex items-center gap-2 text-muted-foreground">
                        <span>{searchTerm}</span> <ChevronsRight className="h-4 w-4" /> <span className="text-foreground font-medium">Well Log</span>
                    </div>
                    <div className="font-code text-sm flex items-center gap-2 text-muted-foreground">
                        <span>{searchTerm}</span> <ChevronsRight className="h-4 w-4" /> <span className="text-foreground font-medium">Well Test</span>
                    </div>
                    <div className="pt-2 mt-2 border-t">
                        <p className="text-xs text-muted-foreground">Mapped from synonym: 'Sumur'</p>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
