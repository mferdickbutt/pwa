/**
 * Main App Component - Warm Memory Book Design
 */

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './stores/authStore';
import LanguageSwitcher from './components/LanguageSwitcher';
import { navIcons } from './components/NavigationIcons';

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
      <header className="sticky top-0 z-20 glass-dark border-b border-white/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container-safe py-4">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
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

      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/50 z-20">
        <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
          <NavLink to="/timeline" translationKey="timeline" icon={navIcons.timeline} />
          <NavLink to="/calendar" translationKey="calendar" icon={navIcons.calendar} />
          <NavLink to="/growth" translationKey="growth" icon={navIcons.growth} />
          <NavLink to="/capsules" translationKey="capsules" icon={navIcons.capsules} />
          <NavLink to="/settings" translationKey="settings" icon={navIcons.profile} />
        </div>
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

  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

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

          <Route path="/" element={<Navigate to="/timeline" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
