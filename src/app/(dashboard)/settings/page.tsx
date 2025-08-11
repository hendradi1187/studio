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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const notificationCategories = [
    { id: 'cat-seismic', label: 'Seismic Data Updates', description: 'New 2D/3D seismic surveys and processing versions.' },
    { id: 'cat-well', label: 'Well Data', description: 'Newly added well logs, core data, and test results.' },
    { id: 'cat-production', label: 'Production Reports', description: 'Monthly and annual production data releases.' },
    { id: 'cat-geochem', label: 'Geochemical Analyses', description: 'New reports and studies on source rocks and fluids.' },
    { id: 'cat-system', label: 'System Announcements', description: 'Updates about the SPEKTOR platform and maintenance.' },
];

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
      className: 'bg-green-500 text-white',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and notification preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Manager</CardTitle>
          <CardDescription>
            Subscribe to categories to receive notifications for new or updated datasets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationCategories.map((category) => (
            <div key={category.id} className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={category.id} className="text-base">
                  {category.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <Switch id={category.id} defaultChecked={category.id === 'cat-well' || category.id === 'cat-system'} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
