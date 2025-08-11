
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search, Link as LinkIcon } from 'lucide-react';
import { users as mockUsers } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: string;
    lastActive: string;
}

const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'KKKS':
        return <Badge className="bg-blue-500 hover:bg-blue-600">KKKS</Badge>;
      case 'Validator':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Validator</Badge>;
      case 'Viewer':
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
};

const UserFormDialog = ({ user, onSave, children }: { user?: User | null, onSave: (user: User) => void, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [organization, setOrganization] = React.useState('');
    const [role, setRole] = React.useState('');

    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setOrganization(user.organization);
            setRole(user.role);
        } else {
            setName('');
            setEmail('');
            setOrganization('');
            setRole('');
        }
    }, [user, isOpen]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const savedUser = {
            id: user ? user.id : `usr${Math.floor(Math.random() * 900) + 100}`,
            name,
            email,
            role,
            organization,
            lastActive: user ? user.lastActive : 'Just now',
        };
        onSave(savedUser);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update the details for this user.' : 'Fill in the details below to add a new user to the system.'}
                    </DialogDescription>
                </DialogHeader>
                <form id="user-form" onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="organization" className="text-right">Organization</Label>
                            <Input id="organization" value={organization} onChange={e => setOrganization(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                            <Select name="role" required value={role} onValueChange={setRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                    <SelectItem value="KKKS">KKKS</SelectItem>
                                    <SelectItem value="Validator">Validator</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" form="user-form">Save User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLdapDialogOpen, setIsLdapDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const handleSaveUser = (savedUser: User) => {
    const isEditing = users.some(u => u.id === savedUser.id);
    if (isEditing) {
        setUsers(users.map(u => (u.id === savedUser.id ? savedUser : u)));
        toast({
            title: "User Updated!",
            description: `Successfully updated ${savedUser.name}.`,
        });
    } else {
        setUsers([savedUser, ...users]);
        toast({
            title: "User Added!",
            description: `Successfully added ${savedUser.name} to the system.`,
        });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    toast({
        title: "User Deleted",
        description: `User ${userToDelete?.name} has been removed.`,
        variant: "destructive",
    })
  }
  
  const handleTestLdap = () => {
      toast({
          title: "Testing Connection...",
          description: "A test connection to the LDAP server was initiated."
      })
  }

  const handleSaveLdap = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast({
          title: "Configuration Saved",
          description: "LDAP configuration has been saved successfully."
      });
      setIsLdapDialogOpen(false);
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.organization.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isLdapDialogOpen} onOpenChange={setIsLdapDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect LDAP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>LDAP Configuration</DialogTitle>
                  <DialogDescription>
                    Configure an optional LDAP connection to sync users.
                  </DialogDescription>
                </DialogHeader>
                <form id="ldap-config-form" onSubmit={handleSaveLdap}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ldap-url">Server URL</Label>
                      <Input id="ldap-url" name="ldap-url" placeholder="ldap://your-server.com:389" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bind-dn">Bind DN</Label>
                      <Input id="bind-dn" name="bind-dn" placeholder="cn=admin,dc=example,dc=com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bind-pw">Bind Password</Label>
                      <Input id="bind-pw" name="bind-pw" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="base-dn">Base DN</Label>
                      <Input id="base-dn" name="base-dn" placeholder="ou=users,dc=example,dc=com" required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="user-filter">User Search Filter</Label>
                      <Input id="user-filter" name="user-filter" placeholder="(objectClass=inetOrgPerson)" required />
                    </div>
                  </div>
                </form>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleTestLdap}>Test Connection</Button>
                  <Button type="submit" form="ldap-config-form">Save & Sync</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <UserFormDialog onSave={handleSaveUser}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add User
                </Button>
            </UserFormDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.organization}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <UserFormDialog user={user} onSave={handleSaveUser}>
                                    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                        Edit
                                    </button>
                                </UserFormDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                            Delete
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the user account for {user.name}.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                           {search ? 'No users found.' : 'No users available.'}
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    