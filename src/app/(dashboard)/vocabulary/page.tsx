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
import { PlusCircle, Search, FileUp, ChevronsRight } from 'lucide-react';
import { vocabulary } from '@/lib/mock-data';

type VocabItem = {
  term: string;
  children?: VocabItem[];
};

const VocabularyList: React.FC<{ items: VocabItem[] }> = ({ items }) => {
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="font-code hover:no-underline">
            {item.term}
          </AccordionTrigger>
          <AccordionContent>
            {item.children ? (
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
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Upload File
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Term
            </Button>
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
                    <VocabularyList items={vocabulary} />
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
