/**
 * Authentication Page - Warm Memory Book Design
 *
 * Handles email link authentication (passwordless).
 * Demo mode available when emulators aren't running.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { sendEmailLink } from '../lib/firebase/auth';
import { getAuthInstance } from '../lib/firebase/config';

// Demo moments for demo mode
const DEMO_MOMENTS = [
  { id: '1', dateTaken: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dateKey: '2025-01-10', caption: 'First smile!', mediaType: 'photo' as const, mediaObjectKey: 'demo1', createdAt: new Date().toISOString(), createdByUid: 'demo-user' },
  { id: '2', dateTaken: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), dateKey: '2025-01-04', caption: 'Tummy time!', mediaType: 'photo' as const, mediaObjectKey: 'demo2', createdAt: new Date().toISOString(), createdByUid: 'demo-user' },
  { id: '3', dateTaken: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), dateKey: '2024-12-12', caption: 'Meeting Santa', mediaType: 'photo' as const, mediaObjectKey: 'demo3', createdAt: new Date().toISOString(), createdByUid: 'demo-user' },
];

export default function AuthPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const auth = getAuthInstance();
      await sendEmailLink(auth, email);

      setMessage(t('auth.linkSent'));
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send sign-in link');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo mode - works without any backend
  const handleDemoMode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Set demo mode in auth store
      const { setDemoMode } = useAuthStore.getState();
      setDemoMode();

      // Set demo moments
      const momentStore = await import('../stores/momentStore');
      momentStore.useMomentStore.setState({
        moments: DEMO_MOMENTS.map((m, i) => ({
          ...m,
          displayUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fef9c3"/><stop offset="100%" style="stop-color:#fed7aa"/></linearGradient></defs><rect fill="url(#bg)" width="400" height="400"/><circle cx="200" cy="150" r="60" fill="#fca5a5"/><circle cx="180" cy="140" r="8" fill="#1f2937"/><circle cx="220" cy="140" r="8" fill="#1f2937"/><path d="M170 180 Q200 210 230 180" stroke="#1f2937" stroke-width="4" fill="none"/><text x="200" y="320" text-anchor="middle" font-size="24" fill="#78350f">First smile!</text></svg>'),
          isUrlLoading: false,
        })),
        hasMore: false,
      });

      navigate('/timeline');
    } catch (err: any) {
      setError(err.message || 'Failed to start demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Animated background decorations */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-primary-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-sunset-200/40 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Logo/Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-400 via-sunset-400 to-rose-400 rounded-3xl mb-6 shadow-warm-lg"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            whileHover={{ scale: 1.05, rotate: 10 }}
          >
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <motion.h1
            className="font-display font-bold text-4xl text-warm-900 mb-2"
            animate={{ backgroundPosition: ['0%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #fb923c 50%, #f43f5e 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('app.name')}
          </motion.h1>
          <p className="text-warm-500 font-medium">{t('app.tagline')}</p>
        </motion.div>

        {/* Sign-in form */}
        <motion.div
          className="glass-dark rounded-3xl shadow-glass-lg p-8 border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display font-bold text-2xl text-warm-800 mb-6">{t('auth.signIn')}</h2>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4 p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-rose-700 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {message && (
              <motion.div
                className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-green-700 font-medium">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-warm-700 mb-2">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 placeholder:text-warm-400"
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-primary-400 via-sunset-400 to-rose-400 text-white py-3.5 rounded-xl font-bold shadow-warm hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all press-feedback"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <motion.span
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('auth.sending')}
                </span>
              ) : (
                t('auth.sendSignInLink')
              )}
            </motion.button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-warm-400 font-medium">{t('common.or')}</span>
              </div>
            </div>

            <motion.button
              onClick={handleDemoMode}
              disabled={isLoading}
              className="mt-5 w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all press-feedback"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <motion.span
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('app.loading')}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="mr-2"
                  >
                    🎮
                  </motion.span>
                  {t('auth.tryDemo')}
                </span>
              )}
            </motion.button>
          </div>

          <p className="mt-6 text-sm text-warm-400 text-center">
            {t('auth.demoDescription')}
          </p>
        </motion.div>

        <p className="mt-6 text-center text-sm text-warm-400">
          {t('auth.termsOfService')}
        </p>
      </motion.div>
    </div>
  );
}
