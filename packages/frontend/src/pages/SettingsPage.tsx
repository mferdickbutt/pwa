/**
 * Settings Page - Account and App Settings
 *
 * User profile, family management, and app settings.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, babies, currentFamily, signOut } = useAuthStore();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/auth');
    } finally {
      setIsSigningOut(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          label: 'Email',
          value: user?.email || '',
          type: 'text' as const,
        },
        {
          label: 'User ID',
          value: user?.uid || '',
          type: 'text' as const,
        },
      ],
    },
    {
      title: 'Family',
      items: [
        {
          label: 'Family Name',
          value: currentFamily?.name || '',
          type: 'text' as const,
        },
        {
          label: 'Babies',
          value: `${babies.length} ${babies.length === 1 ? 'baby' : 'babies'}`,
          type: 'text' as const,
        },
      ],
    },
  ];

  return (
    <div className="pb-safe-or-24">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div>
          <h2 className="font-display font-bold text-3xl text-warm-900 tracking-tight">
            Settings
          </h2>
          <p className="text-warm-500 text-sm mt-1 font-medium">Manage your account</p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="glass rounded-3xl p-6 mb-6 flex items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-sunset-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-warm">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-lg text-warm-900">{user?.email}</p>
          <p className="text-sm text-warm-500">Account Owner</p>
        </div>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, idx) => (
        <motion.div
          key={section.title}
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + idx * 0.1 }}
        >
          <h3 className="text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3 px-2">
            {section.title}
          </h3>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-warm-100">
            {section.items.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 hover:bg-warm-50/50 transition-colors"
              >
                <span className="text-sm font-medium text-warm-600">{item.label}</span>
                <span className="text-sm text-warm-900 font-medium truncate max-w-[200px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Quick Actions */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3 px-2">
          Quick Actions
        </h3>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-warm-100">
          <Link
            to={`/baby/${babies[0]?.id || ''}`}
            className="flex items-center justify-between p-4 hover:bg-warm-50/50 transition-colors"
          >
            <span className="text-sm font-medium text-warm-600">Baby Profile</span>
            <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-warm-50/50 transition-colors text-left"
          >
            <span className="text-sm font-medium text-warm-600">Language</span>
            <span className="text-sm text-warm-400">English</span>
          </button>
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-warm-50/50 transition-colors text-left"
          >
            <span className="text-sm font-medium text-warm-600">Notifications</span>
            <span className="text-sm text-warm-400">On</span>
          </button>
        </div>
      </motion.div>

      {/* Sign Out Button */}
      <motion.button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="w-full p-4 bg-rose-50 text-rose-600 rounded-2xl font-medium hover:bg-rose-100 transition-colors disabled:opacity-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {isSigningOut ? 'Signing out...' : 'Sign Out'}
      </motion.button>

      {/* App Info */}
      <motion.div
        className="mt-8 text-center text-xs text-warm-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>TimeHut v1.0.0</p>
        <p className="mt-1">Made with ❤️ for families</p>
      </motion.div>
    </div>
  );
}
