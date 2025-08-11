
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getPolicies } from '@/lib/api';

type Policy = {
    id: string;
    permissions: number;
    prohibitions: number;
    obligations: number;
}
export default function PoliciesPage() {
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  
  React.useEffect(() => {
    getPolicies().then(data => setPolicies(data as Policy[]));
  }, []);

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
                {policies.length === 0 ? (
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
                        <TableCell>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
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

