import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Clock, Laptop, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Button, Input, Avatar } from '../components/CommonUI';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 019-4829',
    location: 'Houston Hub, Texas',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name: form.name, email: form.email });
    addNotification('Profile Saved', 'Your profile contact details have been updated.', 'success');
  };

  // Mock Active Sessions
  const mockSessions = [
    { device: 'Google Chrome (Windows NT 10.0)', ip: '198.51.100.42', current: true, location: 'Houston, TX' },
    { device: 'Safari (Apple iPhone 15)', ip: '172.56.21.109', current: false, location: 'Dallas, TX' },
  ];

  // Mock recent activities
  const recentActivities = [
    { title: 'Authorized Dispatch T-1005', desc: 'Dispatched Ford Transit from Houston, TX to Chicago, IL', time: '10 mins ago' },
    { title: 'Logged Fuel Expense', desc: 'Logged ₹7,055.00 fuel invoice for CA-8891 Sprinter Van', time: '5 hours ago' },
    { title: 'Approved Radiator Maintenance', desc: 'Approved Volvo FH16 radiator shop diagnostic invoice', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* HEADER banner */}
      <div className="relative h-32 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm overflow-hidden flex items-end p-6">
        <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        
        <div className="flex items-center space-x-4 translate-y-10 z-10">
          <Avatar name={user?.name || 'User'} size="lg" className="ring-4 ring-white dark:ring-slate-950 shadow-md" />
          <div className="text-left select-none">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-xl shadow-xs border border-slate-200/50 dark:border-slate-800">
              {user?.name || 'Alex Mercer'}
            </h2>
          </div>
        </div>
      </div>

      {/* spacer to handle absolute translate gap */}
      <div className="h-6" />

      {/* PROFILE DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Left column: Role summary card & sessions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <Card className="text-center flex flex-col items-center p-6 space-y-4">
            <div className="w-full text-left pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Security Access</h3>
            </div>
            
            <div className="w-full space-y-3.5 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">User Role:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {user?.role || 'Fleet Manager'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">User ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{user?.id || 'USR-4820'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Base Hub:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Houston Terminal (North)</span>
              </div>
            </div>
          </Card>

          {/* Active Sessions */}
          <Card>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center space-x-2 mb-4">
              <Laptop className="w-4.5 h-4.5 text-teal-655" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Active Sessions</h3>
            </div>
            <div className="space-y-4 text-xs font-semibold">
              {mockSessions.map((session, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="space-y-0.5 text-left">
                    <div className="text-slate-850 dark:text-slate-250 truncate max-w-[180px]">{session.device}</div>
                    <div className="text-[10px] text-slate-455 font-medium">{session.ip} • {session.location}</div>
                  </div>
                  {session.current ? (
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 font-bold border border-green-500/25">Current</span>
                  ) : (
                    <span className="text-slate-400 font-medium">Inactive</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Edit forms & recent activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit details */}
          <Card>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center space-x-2 mb-4">
              <User className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-355">Contact Information</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  icon={Phone}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label="Terminal Base Location"
                  icon={MapPin}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary">
                  Update Profile Details
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Activity Logs */}
          <Card>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center space-x-2 mb-4">
              <Clock className="w-4.5 h-4.5 text-indigo-650" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">Recent Activities</h3>
            </div>
            
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4 text-xs">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="relative text-left space-y-1">
                  {/* Indicator Dot */}
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                  
                  <div className="flex justify-between font-bold text-slate-850 dark:text-slate-200">
                    <span>{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
