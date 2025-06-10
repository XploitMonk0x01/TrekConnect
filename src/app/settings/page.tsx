
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";   
import { Label } from "@/components/ui/label";   
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Palette, UserCircle, ShieldQuestion, Save, Loader2, AlertTriangle } from "lucide-react";
import { ThemeToggleSwitch } from "@/components/settings/ThemeToggleSwitch";
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/services/users'; 
import type { UserProfile } from '@/lib/types'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const accountFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function SettingsPage() {
  const { user: currentUser, isLoading: authIsLoading, validateSession } = useCustomAuth();
  const { toast } = useToast();
  const [isLoadingForm, setIsLoadingForm] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name: '', bio: '' },
  });

  useEffect(() => {
    if (currentUser && !authIsLoading) {
      form.reset({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
      });
      setIsLoadingForm(false);
    } else if (!currentUser && !authIsLoading) {
      setIsLoadingForm(false); // No user, form can be shown (with disabled state)
    }
  }, [currentUser, authIsLoading, form]);

  async function onAccountSubmit(data: AccountFormValues) {
    if (!currentUser || !currentUser.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSaving(true);
    
    const profileUpdateData: Partial<Pick<UserProfile, 'name' | 'bio'>> = {
        name: data.name,
        bio: data.bio || null, // Ensure bio is null if empty, not undefined
    };

    try {
      const updatedUser = await updateUserProfile(currentUser.id, profileUpdateData);
      if (updatedUser) {
        toast({ title: 'Account Info Updated', description: 'Your account information has been saved.' });
        await validateSession(); // Refresh user data in context
      } else {
        throw new Error('Failed to update account information.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not save your account information.' });
    } finally {
      setIsSaving(false);
    }
  }

  const renderAccountForm = () => {
    if (authIsLoading || isLoadingForm) {
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

    if (!currentUser && !authIsLoading) { 
        return (
            <div className="text-center p-4 text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
                <p>Please <Link href="/auth/signin?redirect=/settings" className="text-primary underline">sign in</Link> to manage your account settings.</p>
            </div>
        );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAccountSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} placeholder="Your full name" /></FormControl><FormMessage /></FormItem> )} />
            <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={currentUser?.email || ''} placeholder="your@example.com" disabled />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
            </div>
            </div>
            <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} placeholder="A short bio about yourself (optional)" rows={3} /></FormControl><FormMessage /></FormItem> )} />
            
            <Button type="submit" disabled={isSaving || authIsLoading || isLoadingForm}>
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
            <Button variant="outline" disabled={!currentUser}>Change Password (Soon)</Button> 
            {!currentUser && <p className="text-xs text-muted-foreground mt-1">Sign in to change password.</p>}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1">
              <span>Two-Factor Authentication</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Add an extra layer of security to your account. (Coming Soon)
              </span>
            </Label>
            <Switch id="twoFactorAuth" aria-label="Toggle Two-Factor Authentication" disabled />
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
            <Switch id="matchNotifications" defaultChecked disabled={!currentUser}/>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="messageNotifications">New Message Notifications</Label>
            <Switch id="messageNotifications" defaultChecked disabled={!currentUser}/>
          </div>
           {!currentUser && <p className="text-xs text-muted-foreground">Sign in to manage notifications.</p>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Palette className="mr-2 h-5 w-5" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <ThemeToggleSwitch />
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
                        Control who can see your profile. (Coming Soon)
                    </span>
                </Label>
                <Button variant="outline" size="sm" disabled>Manage Visibility</Button>
            </div>
             <Button variant="link" className="p-0 h-auto text-primary">View Privacy Policy</Button>
             <Separator />
             <Button variant="destructive" className="w-full sm:w-auto" disabled={!currentUser}>Delete Account (Soon)</Button>
             {!currentUser && <p className="text-xs text-muted-foreground mt-1">Sign in to delete your account.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
