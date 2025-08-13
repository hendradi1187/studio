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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PlusCircle, 
  Search, 
  FileUp, 
  ChevronsRight, 
  Loader2, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  TreePine,
  Database,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type VocabularyTerm = {
  id: string;
  term: string;
  description?: string;
  parentId?: string;
  parentTerm?: string;
  level: number;
  sortOrder: number;
  childrenCount: number;
  assetsCount: number;
  createdAt: string;
  updatedAt: string;
};

// API functions
async function fetchVocabularyTerms(params?: { 
  search?: string; 
  parentId?: string; 
  level?: number; 
  page?: number; 
  limit?: number; 
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.parentId) searchParams.set('parentId', params.parentId);
  if (params?.level !== undefined) searchParams.set('level', params.level.toString());
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const response = await fetch(`/api/vocabulary?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch vocabulary terms');
  }
  
  return response.json();
}

async function createVocabularyTerm(data: {
  term: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}) {
  const response = await fetch('/api/vocabulary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create vocabulary term');
  }
  
  return response.json();
}

async function updateVocabularyTerm(id: string, data: {
  term?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}) {
  const response = await fetch(`/api/vocabulary/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update vocabulary term');
  }
  
  return response.json();
}

async function deleteVocabularyTerm(id: string) {
  const response = await fetch(`/api/vocabulary/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete vocabulary term');
  }
  
  return response.json();
}

export default function VocabularyPage() {
  const [terms, setTerms] = React.useState<VocabularyTerm[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedParent, setSelectedParent] = React.useState<string>('all');
  const [isAddTermOpen, setIsAddTermOpen] = React.useState(false);
  const [isEditTermOpen, setIsEditTermOpen] = React.useState(false);
  const [editingTerm, setEditingTerm] = React.useState<VocabularyTerm | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = React.useState({
    term: '',
    description: '',
    parentId: '',
    sortOrder: 0,
  });

  const fetchTerms = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (searchTerm) params.search = searchTerm;
      if (selectedLevel !== 'all') params.level = parseInt(selectedLevel);
      if (selectedParent !== 'all') params.parentId = selectedParent;
      
      const response = await fetchVocabularyTerms(params);
      setTerms(response.data.terms);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vocabulary terms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLevel, selectedParent, toast]);

  React.useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const handleAddTerm = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createVocabularyTerm({
        term: formData.term,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
        sortOrder: formData.sortOrder,
      });

      toast({
        title: "Term Created",
        description: `"${formData.term}" has been added successfully.`,
      });

      setIsAddTermOpen(false);
      setFormData({ term: '', description: '', parentId: '', sortOrder: 0 });
      fetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create term",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTerm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTerm) return;

    setIsSubmitting(true);

    try {
      await updateVocabularyTerm(editingTerm.id, {
        term: formData.term,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
        sortOrder: formData.sortOrder,
      });

      toast({
        title: "Term Updated",
        description: `"${formData.term}" has been updated successfully.`,
      });

      setIsEditTermOpen(false);
      setEditingTerm(null);
      setFormData({ term: '', description: '', parentId: '', sortOrder: 0 });
      fetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update term",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTerm = async (term: VocabularyTerm) => {
    if (!confirm(`Are you sure you want to delete "${term.term}"?`)) return;

    try {
      await deleteVocabularyTerm(term.id);
      toast({
        title: "Term Deleted",
        description: `"${term.term}" has been deleted successfully.`,
      });
      fetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete term",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (term: VocabularyTerm) => {
    setEditingTerm(term);
    setFormData({
      term: term.term,
      description: term.description || '',
      parentId: term.parentId || '',
      sortOrder: term.sortOrder,
    });
    setIsEditTermOpen(true);
  };

  // Get unique parent terms for filtering
  const parentTerms = React.useMemo(() => {
    const parents = terms.filter(term => term.level === 0);
    return parents;
  }, [terms]);

  // Get indentation based on level
  const getIndentation = (level: number) => {
    return '  '.repeat(level);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary Management</h1>
          <p className="text-muted-foreground">
            Manage hierarchical vocabulary terms for data classification and search.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddTermOpen} onOpenChange={setIsAddTermOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Term
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vocabulary Term</DialogTitle>
                <DialogDescription>
                  Create a new vocabulary term for data classification.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTerm}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">Term *</Label>
                    <Input
                      id="term"
                      value={formData.term}
                      onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                      placeholder="e.g., Seismic Data"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description of the term"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Term</Label>
                    <Select
                      value={formData.parentId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent term (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Root Level)</SelectItem>
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {getIndentation(term.level)}{term.term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddTermOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Term
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters and Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Terms</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vocabulary terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">Level 0 (Root)</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parent Term</Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  {parentTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Terms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Vocabulary Terms
          </CardTitle>
          <CardDescription>
            Manage and organize your vocabulary terms in a hierarchical structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Children</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No vocabulary terms found</p>
                        <Button variant="outline" onClick={() => setIsAddTermOpen(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add First Term
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  terms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {term.level > 0 && (
                            <span className="text-muted-foreground text-sm">
                              {'└─'.repeat(term.level)}
                            </span>
                          )}
                          {term.term}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={term.description}>
                        {term.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {term.level}</Badge>
                      </TableCell>
                      <TableCell>{term.parentTerm || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{term.childrenCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{term.assetsCount}</Badge>
                      </TableCell>
                      <TableCell>{term.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(term)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTerm(term)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditTermOpen} onOpenChange={setIsEditTermOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vocabulary Term</DialogTitle>
            <DialogDescription>
              Update the vocabulary term details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTerm}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-term">Term *</Label>
                <Input
                  id="edit-term"
                  value={formData.term}
                  onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                  placeholder="e.g., Seismic Data"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of the term"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parent">Parent Term</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent term (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Root Level)</SelectItem>
                    {terms.filter(t => t.id !== editingTerm?.id).map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {getIndentation(term.level)}{term.term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditTermOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Term
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}