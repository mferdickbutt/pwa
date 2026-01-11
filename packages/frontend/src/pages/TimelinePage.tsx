/**
 * Timeline Page - Warm Memory Book Design
 *
 * Displays the baby's moments in a scrollable feed with infinite pagination.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStore';
import MomentItem from '../components/timeline/MomentItem';
import CreateMomentButton from '../components/timeline/CreateMomentButton';

// Staggered animation variants for list items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

export default function TimelinePage() {
  const { t } = useTranslation();
  const { currentFamilyId, babies } = useAuthStore();
  const {
    moments,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoments,
    loadMoreMoments,
    loadAllVisibleUrls,
    error,
  } = useMomentStore();

  const [currentBaby, setCurrentBaby] = useState(babies[0]);

  useEffect(() => {
    setCurrentBaby(babies[0]);
  }, [babies]);

  // Load initial moments when family/baby changes
  useEffect(() => {
    if (currentFamilyId && currentBaby) {
      loadMoments(currentFamilyId, currentBaby.id!, {
        orderBy: 'dateTaken',
        orderDirection: 'desc',
        limit: 20,
      });
    }
  }, [currentFamilyId, currentBaby?.id]);

  // Load visible URLs after moments are loaded
  useEffect(() => {
    if (moments.length > 0 && !isLoading) {
      loadAllVisibleUrls();
    }
  }, [moments.length, isLoading]);

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    loadMoreMoments();
  }, [isLoadingMore, hasMore, loadMoreMoments]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore]);

  if (!currentBaby) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-sunset-100 rounded-full mb-6">
          <motion.svg
            className="w-12 h-12 text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </motion.svg>
        </div>
        <h3 className="font-display font-bold text-xl text-warm-800 mb-2">{t('timeline.noBabyProfile')}</h3>
        <p className="text-warm-500">{t('timeline.createBabyProfile')}</p>
      </motion.div>
    );
  }

  return (
    <div className="pb-safe-or-24">
      {/* Animated Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div>
          <motion.h2
            className="font-display font-bold text-3xl text-warm-900 tracking-tight"
            animate={{ backgroundPosition: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #fb923c 50%, #f43f5e 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('timeline.title')}
          </motion.h2>
          <motion.p
            className="text-warm-500 text-sm mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('timeline.memoriesOf', { name: currentBaby.name })}
          </motion.p>
        </div>
        <CreateMomentButton babyId={currentBaby.id!} />
      </motion.div>

      {/* Error state with animation */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-start">
              <motion.svg
                className="w-6 h-6 text-rose-400 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              <div className="flex-1">
                <p className="text-rose-700 font-medium">{error}</p>
                <motion.button
                  onClick={() => {
                    if (currentFamilyId && currentBaby) {
                      loadMoments(currentFamilyId, currentBaby.id);
                    }
                  }}
                  className="mt-2 text-sm text-rose-600 hover:text-rose-800 font-medium underline decoration-rose-300 underline-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try again
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state with playful animation */}
      <AnimatePresence>
        {!isLoading && moments.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 150 }}
          >
            {/* Animated floating elements */}
            <div className="relative inline-block">
              <motion.div
                className="absolute -top-4 -left-4 w-16 h-16 bg-primary-200 rounded-full opacity-60"
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-sunset-200 rounded-full opacity-60"
                animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/2 -right-8 w-8 h-8 bg-rose-200 rounded-full opacity-60"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary-100 via-sunset-100 to-rose-100 rounded-3xl mb-6 shadow-warm">
                <motion.svg
                  className="w-16 h-16 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </motion.svg>
              </div>
            </div>

            <motion.h3
              className="font-display font-bold text-2xl text-warm-800 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('timeline.noMoments')}
            </motion.h3>
            <motion.p
              className="text-warm-500 mb-8 max-w-xs mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('timeline.noMomentsDescription')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <div className="flex justify-center space-x-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-300"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moments feed with staggered animations */}
      <AnimatePresence mode="popLayout">
        {moments.length > 0 && (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {moments.map((moment) => (
              <motion.div
                key={moment.id}
                variants={itemVariants}
                layout
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <MomentItem
                  moment={moment}
                  babyDob={currentBaby.dob}
                  familyId={currentFamilyId!}
                  babyId={currentBaby.id!}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading more indicator */}
      <AnimatePresence>
        {(isLoading || isLoadingMore) && moments.length > 0 && (
          <motion.div
            className="py-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-primary-400 to-sunset-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className="text-warm-500 font-medium">{t('timeline.loadingMore')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-4" />

      {/* End of feed indicator with celebration */}
      <AnimatePresence>
        {!hasMore && moments.length > 0 && !isLoading && (
          <motion.div
            className="py-10 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-sunset-100 px-6 py-3 rounded-full"
              whileHover={{ scale: 1.02 }}
            >
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.span>
              <span className="text-warm-600 font-medium">{t('timeline.seenItAll')}</span>
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, -20, 20, 0] }}
                transition={{ duration: 0.5 }}
              >
                ✨
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
