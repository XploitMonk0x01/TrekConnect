
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Palette, UserCircle, ShieldQuestion } from "lucide-react";
import { ThemeToggleSwitch } from "@/components/settings/ThemeToggleSwitch"; // Import the new component

export default function SettingsPage() {
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Wanderlust Weaver" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="wanderer@example.com" disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" defaultValue="Passionate trekker and storyteller..." />
          </div>
          <Button>Save Changes</Button>
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
            {/* More appearance settings can go here */}
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
                {/* This would typically be a Select component */}
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
