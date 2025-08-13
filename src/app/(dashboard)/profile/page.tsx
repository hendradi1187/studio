
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
import { Loader2, Save, KeyRound, Camera, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { authenticatedFetch } from '@/lib/auth-client';
import { useUserProfile } from '@/components/user-profile-avatar';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const { profile, setProfile } = useUserProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // Update the profile state to trigger re-render in all components
      if (profile) {
        setProfile({ ...profile, profilePhoto: data.profilePhoto });
      }
      
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>

      {/* Profile Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profilePhoto || undefined} alt="Profile photo" />
                <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                  {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </AvatarFallback>
              </Avatar>
              {isUploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Upload new photo</h4>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or WebP. Max size 2MB. Recommended 400x400px.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePhotoClick}
                  disabled={isUploadingPhoto}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isUploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                </Button>
                {profile?.profilePhoto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (profile) {
                        setProfile({ ...profile, profilePhoto: undefined });
                      }
                    }}
                    disabled={isUploadingPhoto}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Input id="name" defaultValue={profile?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={profile?.email || ''} />
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
