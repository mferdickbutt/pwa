/**
 * Moment Item Component - Warm Memory Book Design
 *
 * Displays a single moment with media, caption, age, and comments.
 * Features glassmorphism card design and smooth micro-interactions.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { formatAgeFromDate } from '../../lib/utils/age';
import { getCommentsForMoment, useMomentStore } from '../../stores/momentStore';
import type { MomentWithUrl } from '../../stores/momentStore';

interface MomentItemProps {
  moment: MomentWithUrl;
  babyDob: string;
  familyId: string;
  babyId: string;
}

export default function MomentItem({ moment, babyDob, familyId, babyId }: MomentItemProps) {
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const comments = getCommentsForMoment(moment.id!);
  const { loadComments, addComment } = useMomentStore();
  const { uid: currentUid } = useAuthStore();

  // Load comments when expanded
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await loadComments(moment.id!);
    }
    setShowComments(!showComments);
  };

  // Add comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUid) return;

    setIsSubmittingComment(true);
    try {
      await addComment(familyId, babyId, moment.id!, newComment.trim(), currentUid);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Load URL if not loaded
  const handleLoadImage = async () => {
    if (!moment.displayUrl && !moment.isUrlLoading) {
      const { loadMomentUrl } = useMomentStore.getState();
      const url = await loadMomentUrl(familyId, moment.mediaObjectKey);

      // Update the moment in store
      useMomentStore.setState({
        moments: useMomentStore.getState().moments.map((m) =>
          m.id === moment.id ? { ...m, displayUrl: url || undefined } : m
        ),
      });
    }
  };

  const age = formatAgeFromDate(new Date(babyDob), new Date(moment.dateTaken));
  const dateTaken = format(new Date(moment.dateTaken), 'MMMM d, yyyy');

  return (
    <motion.article
      className="glass-dark rounded-3xl overflow-hidden hover-lift"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -4 }}
    >
      {/* Media Container with shine effect */}
      <motion.div
        className="media-container cursor-pointer relative overflow-hidden group"
        onClick={handleLoadImage}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {moment.isUrlLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-sunset-50">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-primary-300 to-sunset-400 rounded-2xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        ) : moment.displayUrl ? (
          <>
            {moment.mediaType === 'video' ? (
              <video
                src={moment.displayUrl}
                controls
                className="w-full h-full object-cover"
                poster=""
              />
            ) : (
              <img
                src={moment.displayUrl}
                alt={moment.caption || 'Moment'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )}
            {/* Hover overlay effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          </>
        ) : (
          <motion.button
            onClick={handleLoadImage}
            className="flex flex-col items-center justify-center w-full h-full text-warm-400 hover:text-warm-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.div>
            <span className="text-sm font-medium">{t('timeline.tapToLoad')}</span>
          </motion.button>
        )}
      </motion.div>

      {/* Content Section */}
      <div className="p-5">
        {/* Caption and date */}
        <div className="mb-4">
          {moment.caption && (
            <motion.p
              className="text-warm-800 font-medium text-lg mb-2 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {moment.caption}
            </motion.p>
          )}
          <div className="flex items-center flex-wrap gap-2">
            <motion.span
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-100 to-sunset-100 text-primary-700 rounded-full text-sm font-semibold"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              ⭐ {age}
            </motion.span>
            <span className="text-warm-400 text-sm">•</span>
            <span className="text-warm-500 text-sm font-medium">{dateTaken}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Comment button with animation */}
          <motion.button
            onClick={handleToggleComments}
            className="flex items-center text-warm-600 hover:text-primary-600 font-medium transition-colors press-feedback"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={showComments ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </motion.div>
            <span>{comments.length > 0 ? `${comments.length} ${t('timeline.comments')}` : t('timeline.comment')}</span>
          </motion.button>
        </div>

        {/* Comments Section with expand animation */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              className="mt-4 pt-4 border-t border-warm-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Existing comments */}
              {comments.length > 0 ? (
                <motion.div
                  className="space-y-3 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {comments.map((comment, index) => (
                    <motion.div
                      key={`comment-${index}`}
                      className="flex items-start space-x-2 bg-warm-50 p-3 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-sunset-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(comment.createdByUid === currentUid ? 'You' : `User ${comment.createdByUid.slice(0, 6)}`).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-warm-800 text-sm block">
                          {comment.createdByUid === currentUid ? 'You' : `User ${comment.createdByUid.slice(0, 6)}`}
                        </span>
                        <span className="text-warm-600 text-sm break-words">{comment.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.p
                  className="text-sm text-warm-400 mb-4 text-center italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {t('timeline.noCommentsYet')}
                </motion.p>
              )}

              {/* Add comment form with floating label style */}
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('timeline.addComment')}
                    className="w-full px-4 py-3 pr-12 bg-white/80 border-2 border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 placeholder:text-warm-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                  {newComment && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <span className="text-primary-400">✨</span>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-5 py-3 bg-gradient-to-r from-primary-400 to-sunset-400 text-white rounded-xl text-sm font-bold hover:from-primary-500 hover:to-sunset-500 disabled:opacity-50 disabled:cursor-not-allowed press-feedback shadow-warm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={isSubmittingComment ? { scale: [1, 0.95, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isSubmittingComment ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {t('timeline.sending')}
                    </motion.span>
                  ) : (
                    t('timeline.post')
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
