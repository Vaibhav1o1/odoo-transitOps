import React, { useState } from 'react';
import { Settings, Lock, Bell, Sparkles, Trash2, Globe, Laptop, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Button, Input, Select } from '../components/CommonUI';
import { ConfirmationDialog } from '../components/Modal';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotifications();

  // Settings forms
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    language: 'en',
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    tripUpdates: true,
    maintenanceAlerts: true,
    weeklyDigest: false,
  });

  // Danger zone reset modal
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name: profileForm.name, email: profileForm.email });
    addNotification('Settings Saved', 'Profile settings updated successfully.', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      addNotification('Error', 'New passwords do not match.', 'danger');
      return;
    }
    addNotification('Password Updated', 'Your security password has been changed.', 'success');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    addNotification('Preferences Updated', 'Notification preferences updated.', 'info');
  };

  const handleResetDatabase = () => {
    localStorage.clear();
    addNotification('Database Reset', 'Clearing and restoring database defaults...', 'warning');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure profile metrics, company localizations, notifications, and security options.
        </p>
      </div>

      {/* 1. PROFILE PREFERENCES */}
      <Card>
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Preferences</h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Preferred Language"
              options={[
                { label: 'English (US)', value: 'en' },
                { label: 'Español (ES)', value: 'es' },
                { label: 'Français (FR)', value: 'fr' },
                { label: 'Deutsch (DE)', value: 'de' },
              ]}
              value={profileForm.language}
              onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
            />
            <Select
              label="System Theme Theme"
              options={[
                { label: 'Light Mode', value: 'light' },
                { label: 'Dark Mode', value: 'dark' },
              ]}
              value={theme}
              onChange={toggleTheme}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              Save Profile Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. NOTIFICATIONS CONFIG */}
      <Card>
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <Bell className="w-5 h-5 text-teal-655" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notification Channels</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-4 text-xs font-semibold">
          <div className="flex justify-between items-center pb-4">
            <div>
              <div className="text-slate-850 dark:text-slate-200">Failed Login Email Alerts</div>
              <div className="text-[10px] text-slate-455 font-medium mt-0.5">Receive warnings when sign-ins fail.</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailAlerts}
              onChange={() => handleToggleNotification('emailAlerts')}
              className="rounded text-blue-600 focus:ring-blue-500/20 w-4 h-4 cursor-pointer"
            />
          </div>
          
          <div className="flex justify-between items-center pt-4 pb-4">
            <div>
              <div className="text-slate-855 dark:text-slate-200">Trip Status Dispatches</div>
              <div className="text-[10px] text-slate-455 font-medium mt-0.5">Alert when drivers complete routes.</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.tripUpdates}
              onChange={() => handleToggleNotification('tripUpdates')}
              className="rounded text-blue-600 focus:ring-blue-500/20 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <div className="text-slate-850 dark:text-slate-200">Shop Diagnostic Alerts</div>
              <div className="text-[10px] text-slate-455 font-medium mt-0.5">Notify when critical maintenance is requested.</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.maintenanceAlerts}
              onChange={() => handleToggleNotification('maintenanceAlerts')}
              className="rounded text-blue-600 focus:ring-blue-500/20 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* 3. SECURITY & CREDENTIALS */}
      <Card>
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <Lock className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Password Management</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={!passwordForm.current || !passwordForm.newPass}>
              Change Security Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. DANGER ZONE */}
      <Card className="border-rose-300 dark:border-rose-900/50 bg-rose-500/5 hover:shadow-none">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-rose-200 dark:border-rose-900/30 mb-6">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-455">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
          <div className="text-left space-y-1 pr-4">
            <h4 className="text-rose-800 dark:text-rose-450 font-bold">Reset Mock Operations Database</h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              This clears all persistent storage records (created vehicles, drivers, trips, fuel entries) and loads the default seeded mockup.
            </p>
          </div>
          <Button variant="danger" onClick={() => setIsResetOpen(true)}>
            Reset Database
          </Button>
        </div>
      </Card>

      {/* CONFIRM DATABASE RESET */}
      <ConfirmationDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetDatabase}
        title="Reset Local Mock Database?"
        message="Are you sure you want to clear your local storage and reset all TransitOps data back to its default demonstration state? You will lose any created vehicles, trips, or registered drivers."
        confirmText="Reset Storage"
      />
    </div>
  );
}
