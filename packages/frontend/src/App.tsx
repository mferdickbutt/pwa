/**
 * Main App Component - Warm Memory Book Design
 */

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './stores/authStore';
import LanguageSwitcher from './components/LanguageSwitcher';

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const GrowthPage = lazy(() => import('./pages/GrowthPage'));
const CapsulesPage = lazy(() => import('./pages/CapsulesPage'));
const BabyProfilePage = lazy(() => import('./pages/BabyProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

// Animated loading component with morphing blob
function PageLoader() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
      <div className="text-center">
        {/* Morphing blob loader */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-primary-300 via-primary-400 to-sunset-400 blob-loader mx-auto mb-4"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Animated dots */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="mt-4 font-display text-warm-600 text-sm">{t('app.loadingMemories')}</p>
      </div>
    </div>
  );
}

// Protected route component with onboarding check
function ProtectedRoute({ children, requireOnboarding = true }: { children: React.ReactNode; requireOnboarding?: boolean }) {
  const { user, isLoading, families } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if no family exists
  if (requireOnboarding && families.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Public route (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return <Navigate to="/timeline" replace />;
  }

  return <>{children}</>;
}

// Navigation icons as components
const navIcons = {
  timeline: (isActive: boolean) => (
    <motion.svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        initial={{ pathLength: 0.5 }}
        animate={{ pathLength: isActive ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  ),
  calendar: (isActive: boolean) => (
    <motion.svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </motion.svg>
  ),
  growth: (isActive: boolean) => (
    <motion.svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      animate={isActive ? { y: [0, -5, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        initial={{ pathLength: 0.5 }}
        animate={{ pathLength: isActive ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  ),
  capsules: (isActive: boolean) => (
    <motion.svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </motion.svg>
  ),
  profile: (isActive: boolean) => (
    <motion.svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </motion.svg>
  ),
};

// Navigation link component with animated active state
interface NavLinkProps {
  to: string;
  translationKey: string;
  icon: (isActive: boolean) => React.ReactNode;
}

function NavLink({ to, translationKey, icon }: NavLinkProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = location.pathname === to || (to !== '/timeline' && location.pathname.startsWith(to));

  return (
    <Link to={to} className="relative flex flex-col items-center justify-center flex-1">
      {/* Active indicator pill */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute -top-1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-8 h-1 bg-gradient-to-r from-primary-400 to-sunset-400 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon container */}
      <motion.div
        className={`p-2 rounded-2xl transition-all duration-300 ${
          isActive
            ? 'text-primary-600 bg-gradient-to-br from-primary-50 to-sunset-50 shadow-warm'
            : 'text-warm-500 hover:text-warm-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon(isActive)}
      </motion.div>

      {/* Label */}
      <motion.span
        className={`text-xs mt-1 font-medium transition-colors ${
          isActive ? 'text-warm-800' : 'text-warm-500'
        }`}
        animate={{ fontSize: isActive ? '13px' : '12px' }}
        transition={{ duration: 0.2 }}
      >
        {t(`nav.${translationKey}`)}
      </motion.span>
    </Link>
  );
}

// App shell with modern animated navigation
function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut, currentFamily } = useAuthStore();
  const { t } = useTranslation();

  const handleSignOut = () => {
    signOut();
    sessionStorage.removeItem('demo-mode');
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      {/* Glassmorphism Header with iOS Safe Area */}
      <header className="sticky top-0 z-20 glass-dark border-b border-white/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container-safe py-4">
          <div className="flex items-center justify-between">
            {/* Animated Logo */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-primary-400 to-sunset-400 rounded-xl flex items-center justify-center shadow-warm"
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity={0} />
                  <circle cx="12" cy="12" r="5" />
                </svg>
              </motion.div>
              <div>
                <h1 className="font-display font-bold text-xl text-warm-900 tracking-tight">
                  {t('app.name')}
                </h1>
                {currentFamily && (
                  <motion.p
                    className="text-xs text-warm-500 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentFamily.name}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Sign Out Button */}
              {user && (
                <motion.button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-xl transition-all duration-200 press-feedback"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  {t('app.signOut')}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content with page transition */}
      <main className="container-safe py-6">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={pageTransition}
        >
          {children}
        </motion.div>
      </main>

      {/* Animated Bottom Navigation with iOS Safe Area */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/50 z-20">
        <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
          <NavLink to="/timeline" translationKey="timeline" icon={navIcons.timeline} />
          <NavLink to="/calendar" translationKey="calendar" icon={navIcons.calendar} />
          <NavLink to="/growth" translationKey="growth" icon={navIcons.growth} />
          <NavLink to="/capsules" translationKey="capsules" icon={navIcons.capsules} />
          <NavLink to="/settings" translationKey="settings" icon={navIcons.profile} />
        </div>
        {/* Safe area spacer for iOS Home Indicator */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>
    </div>
  );
}

// Main App component with route transitions
export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while initializing auth
  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth routes */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Onboarding route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <AppShell>
                  <TimelinePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CalendarPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/growth"
            element={
              <ProtectedRoute>
                <AppShell>
                  <GrowthPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/capsules"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CapsulesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/baby/:babyId"
            element={
              <ProtectedRoute>
                <AppShell>
                  <BabyProfilePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <AppShell>
                  <SettingsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/timeline" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
