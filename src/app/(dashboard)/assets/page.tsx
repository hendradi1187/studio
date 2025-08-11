
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { getAssets, deleteAsset } from '@/lib/api';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type Asset = {
  id: string; // Assuming assets have a unique ID
  asset: string;
  description: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
        const data = await getAssets();
        setAssets(data as Asset[]);
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not fetch assets.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    const assetToDelete = assets.find(a => a.id === assetId);
    if (!assetToDelete) return;

    try {
        await deleteAsset(assetId);
        setAssets(assets.filter(a => a.id !== assetId));
        toast({
            title: "Asset Deleted",
            description: `The asset "${assetToDelete.asset}" has been removed.`,
        });
    } catch (error) {
         toast({
            title: "Error",
            description: `Could not delete asset "${assetToDelete.asset}".`,
            variant: "destructive",
        });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage your data assets.</p>
        </div>
        <Button asChild>
          <Link href="/assets/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Asset
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                           <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No assets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium font-mono text-xs">{asset.asset}</TableCell>
                      <TableCell>{asset.description}</TableCell>
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
                                        <Link href={`/assets/create?edit=${asset.id}`}>Edit</Link>
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
                                        This action cannot be undone. This will permanently delete the asset "{asset.asset}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAsset(asset.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
          <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span>{`1-${assets.length} of ${assets.length} results`}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
