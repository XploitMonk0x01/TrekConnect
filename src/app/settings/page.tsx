'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
} from '@/components/ui/alert-dialog'
import {
  Bell,
  Lock,
  Palette,
  UserCircle,
  ShieldQuestion,
  Save,
  Loader2,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import { ThemeToggleSwitch } from '@/components/settings/ThemeToggleSwitch'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'
import { updateUserProfileClient } from '@/services/users'
import type { UserProfile } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useRouter } from 'next/navigation'

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  bio: z
    .string()
    .max(500, { message: 'Bio must not exceed 500 characters.' })
    .optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required.' }),
    newPassword: z
      .string()
      .min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your new password.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'], // path of error
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function SettingsPage() {
  const {
    user: currentUser,
    isLoading: authIsLoading,
    validateSession,
    updateUserInContext,
    signOut,
  } = useCustomAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoadingForm, setIsLoadingForm] = useState(true)
  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name: '', bio: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (currentUser && !authIsLoading) {
      accountForm.reset({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
      })
      setIsLoadingForm(false)
    } else if (!currentUser && !authIsLoading) {
      setIsLoadingForm(false)
    }
  }, [currentUser, authIsLoading, accountForm])

  async function onAccountSubmit(data: AccountFormValues) {
    if (!currentUser || !currentUser.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You are not logged in.',
      })
      return
    }
    setIsSavingAccount(true)

    const profileUpdateData = {
      name: data.name ?? undefined,
      bio: data.bio ?? undefined,
    }

    try {
      await updateUserProfileClient(currentUser.id, profileUpdateData)

      // Update the local context with the new user data
      const updatedUser: UserProfile = {
        ...currentUser,
        name: data.name,
        bio: data.bio ?? currentUser.bio,
      }
      updateUserInContext(updatedUser)

      toast({
        title: 'Account Info Updated',
        description: 'Your account information has been saved.',
      })
      await validateSession()
    } catch (error) {
      console.error('Error updating account:', error)
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Could not update account.',
      })
    } finally {
      setIsSavingAccount(false)
    }
  }

  async function onChangePasswordSubmit(data: PasswordFormValues) {
    if (!currentUser || !currentUser.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You are not logged in.',
      })
      return
    }
    setIsChangingPassword(true)
    try {
      const response = await fetch(`/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password.')
      }
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      })
      passwordForm.reset()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not change your password.',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (!currentUser || !currentUser.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You are not logged in.',
      })
      return
    }
    setIsDeletingAccount(true)
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: 'Failed to delete account.' }))
        throw new Error(result.error || 'Failed to delete account.')
      }
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      })
      signOut() // This will clear local storage and redirect
      router.push('/auth/signup') // Fallback redirect
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not delete your account.',
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const renderAccountForm = () => {
    if (authIsLoading || isLoadingForm) {
      return (
        <div className="space-y-4">
          {/* Name and Email fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label: Full Name */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" /> {/* Label: Email Address */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </div>
          </div>
          {/* Bio field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" /> {/* Label: Bio */}
            <Skeleton className="h-20 w-full" /> {/* Textarea rows=3 */}
          </div>
          {/* Submit Button */}
          <Skeleton className="h-10 w-48" />
        </div>
      )
    }

    if (!currentUser && !authIsLoading) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p>
            Please{' '}
            <Link
              href="/auth/signin?redirect=/settings"
              className="text-primary underline"
            >
              sign in
            </Link>{' '}
            to manage your account settings.
          </p>
        </div>
      )
    }

    return (
      <Form {...accountForm}>
        <form
          onSubmit={accountForm.handleSubmit(onAccountSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={accountForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your full name"
                      disabled={isSavingAccount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                placeholder="your@example.com"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here.
              </p>
            </div>
          </div>
          <FormField
            control={accountForm.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="A short bio about yourself (optional)"
                    rows={3}
                    disabled={isSavingAccount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSavingAccount || authIsLoading || isLoadingForm}
          >
            {isSavingAccount ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Account Changes
          </Button>
        </form>
      </Form>
    )
  }

  const renderPasswordForm = () => {
    if (authIsLoading || isLoadingForm) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      )
    }
    if (!currentUser) return null // No form if not logged in

    return (
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onChangePasswordSubmit)}
          className="space-y-4"
        >
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={isChangingPassword}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={isChangingPassword}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    disabled={isChangingPassword}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Change Password
          </Button>
        </form>
      </Form>
    )
  }

  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Account Info Section */}
          <section>
            <h2 className="text-xl font-semibold font-headline flex items-center border-b pb-2 mb-4">
              <UserCircle className="mr-2 h-5 w-5" /> Account Information
            </h2>
            {renderAccountForm()}
          </section>

          <Separator />

          {/* Security Section */}
          <section>
            <h2 className="text-xl font-semibold font-headline flex items-center border-b pb-2 mb-4">
              <Lock className="mr-2 h-5 w-5" /> Security
            </h2>
            <div className="space-y-4">
              {renderPasswordForm()}
              <Separator />
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="twoFactorAuth"
                  className="flex flex-col space-y-1"
                >
                  <span>Two-Factor Authentication</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Add an extra layer of security to your account. (Coming
                    Soon)
                  </span>
                </Label>
                <Switch
                  id="twoFactorAuth"
                  aria-label="Toggle Two-Factor Authentication"
                  disabled
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Notifications Section */}
          <section>
            <h2 className="text-xl font-semibold font-headline flex items-center border-b pb-2 mb-4">
              <Bell className="mr-2 h-5 w-5" /> Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="matchNotifications">
                  New Match Notifications
                </Label>
                <Switch
                  id="matchNotifications"
                  defaultChecked
                  disabled={!currentUser}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="messageNotifications">
                  New Message Notifications
                </Label>
                <Switch
                  id="messageNotifications"
                  defaultChecked
                  disabled={!currentUser}
                />
              </div>
              {!currentUser && (
                <p className="text-xs text-muted-foreground">
                  Sign in to manage notifications.
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Appearance Section */}
          <section>
            <h2 className="text-xl font-semibold font-headline flex items-center border-b pb-2 mb-4">
              <Palette className="mr-2 h-5 w-5" /> Appearance
            </h2>
            <ThemeToggleSwitch />
          </section>

          <Separator />

          {/* Data & Privacy Section */}
          <section>
            <h2 className="text-xl font-semibold font-headline flex items-center border-b pb-2 mb-4 text-destructive">
              <Trash2 className="mr-2 h-5 w-5" /> Danger Zone
            </h2>
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={!currentUser || isDeletingAccount}
                    >
                      {isDeletingAccount ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeletingAccount ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Yes, delete account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {!currentUser && (
              <p className="text-xs text-muted-foreground mt-1">
                Sign in to manage your account data.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
