/**
 * Create Moment Button Component - Warm Memory Book Design
 *
 * Animated floating action button that opens the moment creation modal.
 * Features spring animations and playful micro-interactions.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useMomentStore } from '../../stores/momentStore';
import { getDateFnsLocale } from '../../lib/i18n/config';
import { getDateKey } from '../../lib/utils/calendar';

interface CreateMomentButtonProps {
  babyId: string;
}

export default function CreateMomentButton(_props: CreateMomentButtonProps) {
  const { t, i18n } = useTranslation();
  const locale = getDateFnsLocale(i18n.language);
  const { user, currentFamilyId, babies } = useAuthStore();
  const { createMoment } = useMomentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [dateTaken, setDateTaken] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBaby = babies[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // Videos don't need preview for now
    }
  };

  const handleCreateMoment = async () => {
    if (!selectedFile || !currentBaby || !currentFamilyId || !user) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a demo object key for now (in production, this would be uploaded to S3)
      const objectKey = `moments/${Date.now()}-${selectedFile.name}`;

      // For demo mode, create the moment with local preview
      await createMoment(
        currentFamilyId,
        currentBaby.id!,
        {
          mediaType: selectedFile.type.startsWith('image/') ? 'photo' : 'video',
          mediaObjectKey: objectKey,
          dateTaken: new Date(dateTaken).toISOString(),
          dateKey: getDateKey(new Date(dateTaken)),
          caption: caption.trim(),
        },
        user.uid,
        previewUrl ? { url: previewUrl, file: selectedFile } : undefined
      );

      // Reset and close
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setDateTaken(format(new Date(), 'yyyy-MM-dd'));
      setIsOpen(false);

      // Clean up object URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create moment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setDateTaken(format(new Date(), 'yyyy-MM-dd'));
    setError(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Animated Primary Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-400 via-sunset-400 to-rose-400 text-white rounded-2xl font-bold shadow-warm-lg hover:shadow-glow transition-all duration-300"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Animated plus icon */}
        <motion.div
          className="w-6 h-6 mr-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </motion.div>
        <span className="bg-gradient-to-r from-primary-100 to-sunset-100 bg-clip-text text-transparent font-bold">
          {t('timeline.addMoment')}
        </span>
      </motion.button>

      {/* Animated Modal Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              className="fixed inset-0 bg-warm-900/30 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 pointer-events-none">
              <motion.div
                className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-glass-lg border border-white/50 pointer-events-auto"
                initial={{ opacity: 0, scale: 0.95, y: '100%' }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: '100%' }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {/* Header with drag handle */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pt-3 pb-2 px-6 border-b border-warm-100">
                  <div className="w-12 h-1 bg-warm-300 rounded-full mx-auto mb-3 sm:hidden" />
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl text-warm-800">
                      {t('timeline.addMoment')}
                    </h3>
                    <motion.button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-500 hover:bg-warm-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Image Preview or Upload Area */}
                  {previewUrl ? (
                    <motion.div
                      className="relative mb-4 rounded-2xl overflow-hidden shadow-warm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full aspect-square object-cover"
                      />
                      <motion.button
                        onClick={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ) : selectedFile?.type.startsWith('video/') ? (
                    <motion.div
                      className="relative mb-4 rounded-2xl overflow-hidden bg-warm-100 aspect-square flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-center">
                        <svg className="w-16 h-16 text-warm-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-warm-600 font-medium">{selectedFile.name}</p>
                      </div>
                      <motion.button
                        onClick={() => {
                          setSelectedFile(null);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="relative border-3 border-dashed border-warm-200 rounded-2xl p-8 text-center mb-4 overflow-hidden group hover:border-primary-300 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary-50 to-sunset-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <div className="relative">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <svg className="w-12 h-12 text-warm-300 mx-auto mb-3 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </motion.div>
                        <p className="text-warm-600 font-medium mb-1">{t('common.tapToSelect')}</p>
                        <p className="text-warm-400 text-xs">JPG, PNG, or MP4 up to 50MB</p>
                      </div>
                    </motion.div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Date Picker */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      {t('growth.date')}
                    </label>
                    <input
                      type="date"
                      value={dateTaken}
                      onChange={(e) => setDateTaken(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                    />
                  </div>

                  {/* Caption Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      {t('timeline.addComment')}
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder={t('timeline.noCommentsYet')}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 placeholder:text-warm-400 resize-none"
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm"
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
                      onClick={handleClose}
                      disabled={isUploading}
                      className="flex-1 px-5 py-3 border-2 border-warm-200 text-warm-600 rounded-xl font-semibold hover:bg-warm-50 disabled:opacity-50 transition-colors"
                      whileHover={{ scale: isUploading ? 1 : 1.02 }}
                      whileTap={{ scale: isUploading ? 1 : 0.98 }}
                    >
                      {t('common.cancel')}
                    </motion.button>
                    <motion.button
                      onClick={handleCreateMoment}
                      disabled={!selectedFile || isUploading}
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-400 to-sunset-400 text-white rounded-xl font-bold shadow-warm hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      whileHover={{ scale: !selectedFile || isUploading ? 1 : 1.02 }}
                      whileTap={{ scale: !selectedFile || isUploading ? 1 : 0.98 }}
                    >
                      {isUploading ? (
                        <span className="flex items-center">
                          <motion.span
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          {t('auth.sending')}
                        </span>
                      ) : (
                        t('common.upload')
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
