
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
        toast({
            title: "Profile Updated",
            description: "Your personal information has been saved.",
        });
        setIsSaving(false);
    }, 1000);
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
     setTimeout(() => {
        toast({
            title: "Password Updated",
            description: "Please use your new password to log in next time.",
        });
        setIsChangingPassword(false);
    }, 1000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>

      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name, email, and organization details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Admin Spektor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="admin@spektor.com" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" defaultValue="SKK Migas" disabled />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
              </Button>
          </CardFooter>
        </Card>
      </form>
      
      <Separator />

      <form onSubmit={handleChangePassword}>
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    For security, please choose a strong password.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button type="submit" variant="outline" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                </Button>
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
