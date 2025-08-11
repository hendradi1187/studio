
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getPolicies, deletePolicy } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


type Policy = {
    id: string;
    permissions: number;
    prohibitions: number;
    obligations: number;
}
export default function PoliciesPage() {
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  
  React.useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await getPolicies();
      setPolicies(data as Policy[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch policies.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    const policyToDelete = policies.find(p => p.id === policyId);
    if (!policyToDelete) return;

    try {
        await deletePolicy(policyId);
        setPolicies(policies.filter(p => p.id !== policyId));
        toast({
            title: "Policy Deleted",
            description: `Policy "${policyToDelete?.id}" has been removed.`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: `Could not delete policy "${policyToDelete?.id}".`,
            variant: "destructive",
        });
    }
  }

  const getBadge = (count: number) => {
    if (count > 0) {
        return <Badge variant="secondary">{count}</Badge>
    }
    return <Badge variant="outline">{count}</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies</h1>
          <p className="text-muted-foreground">Manage your data access policies.</p>
        </div>
        <Button asChild>
          <Link href="/policies/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Policy
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy List</CardTitle>
          <CardDescription>A list of all policies in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy ID</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Prohibitions</TableHead>
                  <TableHead>Obligations</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : policies.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No policies found.
                        </TableCell>
                    </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.id}</TableCell>
                        <TableCell>{getBadge(policy.permissions)}</TableCell>
                        <TableCell>{getBadge(policy.prohibitions)}</TableCell>
                        <TableCell>{getBadge(policy.obligations)}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/policies/create?edit=${policy.id}`}>Edit</Link>
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                             <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                                Delete
                                            </button>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the policy "{policy.id}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeletePolicy(policy.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
