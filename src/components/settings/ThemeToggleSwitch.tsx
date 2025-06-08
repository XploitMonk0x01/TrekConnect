
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function ThemeToggleSwitch() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Set initial state based on current theme when component mounts
    // Ensure this runs only on the client
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="darkMode" className="text-foreground">Dark Mode</Label>
      <Switch
        id="darkMode"
        checked={isDarkMode}
        onCheckedChange={handleThemeChange}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
