/**
 * Time Capsules Page - Warm Memory Book Design
 *
 * Create and view time capsules that unlock on future dates.
 * Mobile-first design optimized for iOS.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getCountdown, formatCountdownDigital } from '../lib/utils/countdown';
import { useAuthStore } from '../stores/authStore';
import { useCapsuleStore } from '../stores/capsuleStore';
import { getDateFnsLocale } from '../lib/i18n/config';

export default function CapsulesPage() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { babies, user, currentFamilyId } = useAuthStore();
  const { capsules, createCapsule } = useCapsuleStore();
  const currentBaby = babies[0];
  const locale = getDateFnsLocale(i18n.language);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load capsules when component mounts
  useEffect(() => {
    if (currentBaby && currentFamilyId) {
      useCapsuleStore.getState().loadCapsules(currentFamilyId, currentBaby.id!);
    }
  }, [currentBaby, currentFamilyId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 files
    if (selectedFiles.length + files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    // Validate file types
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        setError('Only images and videos are allowed');
      }
      return isValid;
    });

    // Validate file sizes (max 50MB each)
    const sizeValidFiles = validFiles.filter((file) => {
      const isValid = file.size <= 50 * 1024 * 1024;
      if (!isValid) {
        setError('File size must be less than 50MB');
      }
      return isValid;
    });

    // Create previews for images
    const newPreviews: string[] = [];
    sizeValidFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        newPreviews.push(''); // Placeholder for videos
      }
    });

    setSelectedFiles([...selectedFiles, ...sizeValidFiles]);
    setPreviewUrls([...previewUrls, ...newPreviews]);
    setError(null);
  };

  const removeFile = (index: number) => {
    // Revoke object URL if image
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleCreateCapsule = async () => {
    if (!currentBaby || !currentFamilyId || !user) return;

    if (!title.trim() || !unlockDate || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Create media object keys for files
      const mediaObjectKeys = selectedFiles.map((file) =>
        `capsules/${Date.now()}-${file.name}`
      );

      await createCapsule(
        currentFamilyId,
        currentBaby.id!,
        {
          title: title.trim(),
          unlockAt: new Date(unlockDate).toISOString(),
          content: content.trim(),
          mediaObjectKeys,
          mediaTypes: selectedFiles.map((f) => f.type.startsWith('image/') ? 'photo' as const : 'video' as const),
        },
        user.uid
      );

      // Cleanup
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

      // Reset form
      setTitle('');
      setUnlockDate('');
      setContent('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create capsule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseForm = () => {
    // Cleanup previews
    previewUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });

    setTitle('');
    setUnlockDate('');
    setContent('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError(null);
    setShowCreateForm(false);
  };

  const lockedCapsules = capsules.filter((c) => new Date(c.unlockAt) > new Date());
  const unlockedCapsules = capsules.filter((c) => new Date(c.unlockAt) <= new Date());

  if (!currentBaby) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-sunset-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-warm-800 mb-2">{t('capsules.noBabyProfile')}</h3>
        <p className="text-warm-500">{t('capsules.createBabyProfile')}</p>
      </motion.div>
    );
  }

  return (
    <div className="pb-safe-or-24">
      {/* Animated Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div>
          <h2 className="font-display font-bold text-3xl text-warm-900 tracking-tight">
            {t('capsules.title')}
          </h2>
          <p className="text-warm-500 text-sm mt-1 font-medium">{t('capsules.subtitle')}</p>
        </div>
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-400 to-sunset-400 text-white rounded-2xl font-bold shadow-warm hover:shadow-warm-lg press-feedback"
          whileHover={{ scale: 1.02, rotate: [0, -5, 5, 0] }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreateForm ? t('common.cancel') : t('capsules.newCapsule')}
        </motion.button>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-warm-900/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseForm}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-glass-lg border border-white/50 pointer-events-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-warm-800 mb-4">{t('capsules.createCapsule')}</h3>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">{t('capsules.title')}</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('capsules.titlePlaceholder')}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 placeholder:text-warm-400"
                      />
                    </div>

                    {/* Unlock Date */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">{t('capsules.unlockDate')}</label>
                      <input
                        type="date"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">{t('capsules.content')}</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        placeholder={t('capsules.contentPlaceholder')}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 placeholder:text-warm-400 resize-none"
                      />
                    </div>

                    {/* Media Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">
                        {t('common.upload')} <span className="text-warm-400 font-normal">(optional, max 10)</span>
                      </label>

                      {/* Preview Grid */}
                      {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {selectedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              className="relative aspect-square rounded-xl overflow-hidden bg-warm-100"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              {previewUrls[index] ? (
                                <img
                                  src={previewUrls[index]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-sunset-50">
                                  <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <motion.button
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </motion.button>
                            </motion.div>
                          ))}
                          {/* Add more button */}
                          {selectedFiles.length < 10 && (
                            <motion.button
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-xl border-2 border-dashed border-warm-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <svg className="w-6 h-6 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </motion.button>
                            )}
                        </div>
                      )}

                      {/* Upload area (shown when no files or can add more) */}
                      {selectedFiles.length === 0 && (
                        <motion.div
                          className="border-2 border-dashed border-warm-200 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <svg className="w-10 h-10 text-warm-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-warm-600 text-sm font-medium">{t('common.tapToSelect')}</p>
                          <p className="text-warm-400 text-xs mt-1">JPG, PNG, MP4 up to 50MB</p>
                        </motion.div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleCreateCapsule}
                        disabled={isSaving}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-400 to-sunset-400 text-white rounded-xl font-bold shadow-warm hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed press-feedback flex items-center justify-center"
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                      >
                        {isSaving ? (
                          <span className="flex items-center">
                            <motion.span
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            {t('auth.sending')}
                          </span>
                        ) : (
                          t('capsules.create')
                        )}
                      </motion.button>
                      <motion.button
                        onClick={handleCloseForm}
                        disabled={isSaving}
                        className="px-5 py-3 border-2 border-warm-200 text-warm-600 rounded-xl font-semibold hover:bg-warm-50 disabled:opacity-50 press-feedback"
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                      >
                        {t('common.cancel')}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Locked capsules */}
      <AnimatePresence>
        {lockedCapsules.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="font-display font-bold text-xl text-warm-800 mb-4 flex items-center">
              <motion.span
                className="w-8 h-8 bg-gradient-to-br from-primary-400 to-sunset-400 rounded-xl flex items-center justify-center mr-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.span>
              {t('capsules.lockedCapsules')} ({lockedCapsules.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lockedCapsules.map((capsule) => {
                const countdown = getCountdown(new Date(capsule.unlockAt));
                const hasMedia = capsule.mediaObjectKeys && capsule.mediaObjectKeys.length > 0;
                return (
                  <motion.div
                    key={capsule.id}
                    className="glass-dark rounded-3xl shadow-glass overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className={`relative ${hasMedia ? 'aspect-square' : 'aspect-video sm:aspect-video'} bg-gradient-to-br from-primary-100 to-sunset-100 flex items-center justify-center`}>
                      {hasMedia ? (
                        <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                          {capsule.mediaObjectKeys.slice(0, 4).map((key, i) => (
                            <div key={i} className="bg-warm-200/50 rounded-lg overflow-hidden flex items-center justify-center">
                              <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          className="w-20 h-20 bg-gradient-to-br from-primary-300 to-sunset-400 rounded-2xl flex items-center justify-center shadow-warm"
                          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-display font-bold text-lg text-warm-800 mb-1">{capsule.title}</h4>
                      <p className="text-sm text-warm-500 mb-3">{t('capsules.unlocks', { date: format(new Date(capsule.unlockAt), 'MMMM d, yyyy', { locale }) })}</p>
                      <div className="bg-gradient-to-r from-primary-50 to-sunset-50 border border-primary-200 rounded-xl p-3">
                        <p className="text-xs text-primary-700 font-semibold uppercase tracking-wider mb-1">{t('capsules.timeRemaining')}</p>
                        <p className="text-xl sm:text-2xl font-mono text-primary-900 font-bold">
                          {formatCountdownDigital(countdown)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocked capsules */}
      <AnimatePresence>
        {unlockedCapsules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="font-display font-bold text-xl text-emerald-600 mb-4 flex items-center">
              <motion.span
                className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mr-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </motion.span>
              {t('capsules.readyToOpen')} ({unlockedCapsules.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unlockedCapsules.map((capsule) => (
                <motion.div
                  key={capsule.id}
                  className="glass-dark rounded-3xl shadow-glass p-5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <h4 className="font-display font-bold text-lg text-warm-800 mb-2">{capsule.title}</h4>
                  <p className="text-warm-600 mb-4">{capsule.content}</p>
                  <motion.button
                    className="w-full px-5 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl press-feedback"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('capsules.openCapsule')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {capsules.length === 0 && !showCreateForm && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary-100 via-sunset-100 to-rose-100 rounded-3xl mb-6 shadow-warm"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-14 h-14 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-warm-800 mb-3">{t('capsules.noCapsules')}</h3>
            <p className="text-warm-500">{t('capsules.noCapsulesDescription')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
