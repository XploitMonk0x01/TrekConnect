
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Palette, UserCircle, ShieldQuestion, Save, Loader2 } from "lucide-react";
import { ThemeToggleSwitch } from "@/components/settings/ThemeToggleSwitch";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/services/users';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Import Form components
import type { Control } from "react-hook-form";


const accountFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function SettingsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (firebaseUser) {
      setCurrentUserEmail(firebaseUser.email);
      setIsLoadingProfile(true);
      getUserProfile(firebaseUser.uid)
        .then(profile => {
          if (profile) {
            form.reset({
              name: profile.name || '',
              bio: profile.bio || '',
            });
          }
        })
        .catch(error => {
          console.error("Failed to fetch user profile for settings:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load profile data for settings.' });
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else if (!authLoading) {
      setIsLoadingProfile(false);
    }
  }, [firebaseUser, authLoading, form, toast]);

  async function onAccountSubmit(data: AccountFormValues) {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSaving(true);
    
    const profileUpdateData: Partial<Pick<UserProfile, 'name' | 'bio'>> = {
      name: data.name,
      bio: data.bio || undefined,
    };

    try {
      await updateUserProfile(firebaseUser.uid, profileUpdateData);
      toast({ title: 'Account Info Updated', description: 'Your account information has been saved.' });
    } catch (error) {
      console.error("Error updating account info:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your account information.' });
    } finally {
      setIsSaving(false);
    }
  }

  const renderAccountForm = () => {
    if (authLoading || isLoadingProfile) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
            <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-10 w-full" /></div>
          </div>
          <div><Skeleton className="h-4 w-1/4 mb-2" /><Skeleton className="h-20 w-full" /></div>
          <Skeleton className="h-10 w-24" />
        </div>
      );
    }

    if (!firebaseUser && !authLoading) {
        return <p className="text-muted-foreground">Please <Link href="/auth/signin" className="text-primary underline">sign in</Link> to manage your account settings.</p>;
    }

    return (
      <Form {...form}> {/* Wrap with Form provider */}
        <form onSubmit={form.handleSubmit(onAccountSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldItem control={form.control} name="name" label="Full Name" placeholder="Your full name" />
            <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={currentUserEmail || ''} placeholder="your@example.com" disabled />
            </div>
            </div>
            <FormFieldItem control={form.control} name="bio" label="Bio" placeholder="A short bio about yourself (optional)" isTextarea={true} />
            
            <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
            </Button>
        </form>
      </Form>
    );
  }


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Settings</CardTitle>
          <CardDescription>Manage your account preferences and settings.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><UserCircle className="mr-2 h-5 w-5" /> Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          {renderAccountForm()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Lock className="mr-2 h-5 w-5" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1">
              <span>Two-Factor Authentication</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Add an extra layer of security to your account.
              </span>
            </Label>
            <Switch id="twoFactorAuth" aria-label="Toggle Two-Factor Authentication" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Bell className="mr-2 h-5 w-5" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="matchNotifications">New Match Notifications</Label>
            <Switch id="matchNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="messageNotifications">New Message Notifications</Label>
            <Switch id="messageNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="eventNotifications">Local Event Alerts</Label>
            <Switch id="eventNotifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="suggestionNotifications">Personalized Suggestions</Label>
            <Switch id="suggestionNotifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Palette className="mr-2 h-5 w-5" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <ThemeToggleSwitch /> {/* Use the new Client Component here */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><ShieldQuestion className="mr-2 h-5 w-5" /> Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="profileVisibility" className="flex flex-col space-y-1">
                    <span>Profile Visibility</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Control who can see your profile in ConnectSphere.
                    </span>
                </Label>
                <Button variant="outline" size="sm">Manage Visibility</Button>
            </div>
             <Button variant="link" className="p-0 h-auto text-primary">View Privacy Policy</Button>
             <Separator />
             <Button variant="destructive" className="w-full sm:w-auto">Delete Account</Button>
        </CardContent>
      </Card>

    </div>
  );
}

// Helper component for FormField items in settings

interface FormFieldItemProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  isTextarea?: boolean;
}

function FormFieldItem({ control, name, label, placeholder, isTextarea = false }: FormFieldItemProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextarea ? (
              <Textarea placeholder={placeholder} {...field} rows={3} />
            ) : (
              <Input placeholder={placeholder} {...field} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

