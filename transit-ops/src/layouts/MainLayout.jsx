import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  IndianRupee,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Avatar, Badge, Button } from '../components/CommonUI';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { isOpen: notifOpen, setIsOpen: setNotifOpen, notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotifications();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/vehicles', icon: Truck },
    { label: 'Drivers', path: '/drivers', icon: Users },
    { label: 'Trips', path: '/trips', icon: Map },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Fuel & Expenses', path: '/expenses', icon: IndianRupee },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  // Sidebar item rendering helper
  const renderSidebarLink = (item) => {
    const isActive = currentPath === item.path;
    const Icon = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => {
          navigate(item.path);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center py-3.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
            : 'text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed && 'sm:mx-auto'}`} />
        <span
          className={`ml-3.5 transition-opacity duration-250 truncate ${
            sidebarCollapsed ? 'sm:hidden' : 'inline'
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* MOBILE BACKDROP FOR SIDEBAR */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR: COLLAPSIBLE ON DESKTOP, COLLAPSED ON TABLET, SLIDE-OUT DRAWER ON MOBILE */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 sm:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } ${sidebarCollapsed ? 'sm:w-20' : 'sm:w-64'}`}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center px-6 justify-between border-b border-slate-200 dark:border-slate-850">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
              TO
            </div>
            <span
              className={`ml-3 font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 bg-clip-text text-transparent transition-opacity duration-200 ${
                sidebarCollapsed ? 'sm:hidden' : 'inline'
              }`}
            >
              TransitOps
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-600 sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => renderSidebarLink(item))}
        </nav>

        {/* LOGOUT AREA */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-850">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-rose-650 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed && 'sm:mx-auto'}`} />
            <span
              className={`ml-3.5 truncate transition-opacity duration-200 ${
                sidebarCollapsed ? 'sm:hidden' : 'inline'
              }`}
            >
              Log Out
            </span>
          </button>
        </div>

        {/* COLLAPSE SIDEBAR HANDLE ON DESKTOP */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden sm:flex absolute -right-3.5 top-18 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1.5 rounded-full shadow-xs text-slate-400 hover:text-slate-600 active:scale-95 transition-transform"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'sm:pl-20' : 'sm:pl-64'
        }`}
      >
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            
            {/* Desktop Mock Search */}
            <div className="relative hidden md:block w-64 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, trips, vehicles..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-sm pl-9 pr-4 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-550 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Info */}
            {user && (
              <div className="flex items-center pl-2 space-x-2.5 border-l border-slate-200 dark:border-slate-800">
                <Avatar name={user.name} size="md" />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {user.name}
                  </span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ROUTING VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* NOTIFICATION SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {notifOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-250 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-555">Notifications</h3>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Tools */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-850">
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-450 hover:underline"
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-xs font-semibold text-slate-450 hover:text-rose-500 hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-450 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-5 text-left cursor-pointer transition-colors duration-150 ${
                        notif.read
                          ? 'bg-white dark:bg-slate-900 text-slate-500'
                          : 'bg-blue-50/30 dark:bg-blue-900/5 text-slate-800 dark:text-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold pr-2">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1.5">{notif.message}</p>
                      <span className="block text-[10px] text-slate-400 mt-2">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
