import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'orders', label: 'Order History', icon: Package, route: '/orders' },
  { id: 'prescriptions', label: 'Saved Prescriptions', icon: FileText, route: '/prescriptions' },
  { id: 'addresses', label: 'Manage Addresses', icon: MapPin, route: '/addresses' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, route: '/help' },
];

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, darkMode, toggleDarkMode, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return (
      <MobileLayout>
        <div className="safe-top flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <User size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to continue</h2>
          <p className="text-muted-foreground mb-6">
            Access your orders, prescriptions, and more
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="gradient-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl"
          >
            Sign In
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="safe-top pb-6">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* User Card */}
        <div className="px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="swift-card flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">{user?.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="text-sm text-primary font-medium"
            >
              Edit
            </button>
          </motion.div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="px-4 pb-4">
          <button
            onClick={toggleDarkMode}
            className="swift-card w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon size={20} className="text-primary" />
              ) : (
                <Sun size={20} className="text-accent" />
              )}
              <span className="font-medium">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div
              className={cn(
                "w-12 h-7 rounded-full relative transition-colors",
                darkMode ? "bg-primary" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-all",
                  darkMode ? "right-1" : "left-1"
                )}
              />
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 pb-4">
          <div className="swift-card divide-y divide-border">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(item.route)}
                  className="w-full flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="px-4">
          <button
            onClick={handleLogout}
            className="swift-card w-full flex items-center gap-3 text-destructive"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive-light flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Log Out</span>
          </button>
        </div>

        {/* App Version */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">SwiftCare v1.0.0</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
