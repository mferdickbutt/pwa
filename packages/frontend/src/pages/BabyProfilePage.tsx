/**
 * Baby Profile Page - Warm Memory Book Design
 *
 * Displays baby's profile information and milestones.
 * Mobile-first design optimized for iOS.
 */

import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { getCurrentAge } from '../lib/utils/age';
import { getDateFnsLocale } from '../lib/i18n/config';

// Static milestones list (TODO: Migrate to Firestore for v2)
const MILESTONES = [
  { age: '0-3 months', description: 'milestones.firstSmile', achieved: true },
  { age: '3-6 months', description: 'milestones.rollsOver', achieved: true },
  { age: '6-9 months', description: 'milestones.sitsWithoutSupport', achieved: true },
  { age: '9-12 months', description: 'milestones.firstSteps', achieved: false },
  { age: '12-18 months', description: 'milestones.firstWord', achieved: false },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Boy', icon: '👦' },
  { value: 'female', label: 'Girl', icon: '👧' },
];

export default function BabyProfilePage() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { babies } = useAuthStore();
  const { updateBaby } = useAuthStore();
  const babyId = useParams<{ babyId: string }>()?.babyId || babies[0]?.id;
  const baby = babies.find((b) => b.id === babyId) || babies[0];
  const locale = getDateFnsLocale(i18n.language);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [editProfilePic, setEditProfilePic] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAge = baby ? getCurrentAge(new Date(baby.dob)) : '';

  const handleEditClick = () => {
    if (!baby) return;
    setEditName(baby.name);
    setEditDob(new Date(baby.dob).toISOString().split('T')[0]);
    setEditGender(baby.gender === 'female' ? 'female' : 'male');
    setEditProfilePic(null);
    setError(null);
    setShowEditForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setEditProfilePic(URL.createObjectURL(file));
    setError(null);
  };

  const handleSaveProfile = async () => {
    if (!baby || !babyId) return;

    if (!editName.trim() || !editDob) {
      setError('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateBaby(babyId, {
        name: editName.trim(),
        dob: new Date(editDob).toISOString(),
        gender: editGender,
        ...(editProfilePic && { profilePicUrl: editProfilePic }),
      });

      setShowEditForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!baby) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-sunset-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-warm-800 mb-2">{t('profile.profileNotFound')}</h3>
        <p className="text-warm-500">{t('profile.noBabyProfile')}</p>
      </motion.div>
    );
  }

  return (
    <div className="pb-safe-or-24">
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditForm && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-warm-900/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowEditForm(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                className="bg-white rounded-3xl max-w-md w-full shadow-glass-lg border border-white/50 pointer-events-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-warm-800 mb-4">Edit Profile</h3>
                  <div className="space-y-4">
                    {/* Profile Picture */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">Profile Picture</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-warm-100 to-warm-200 flex-shrink-0 border-2 border-warm-200">
                          {editProfilePic ? (
                            <img src={editProfilePic} alt="Preview" className="w-full h-full object-cover" />
                          ) : baby.profilePicUrl ? (
                            <img src={baby.profilePicUrl} alt="Current" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <motion.button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Choose Photo
                          </motion.button>
                          {editProfilePic && (
                            <motion.button
                              type="button"
                              onClick={() => setEditProfilePic(null)}
                              className="ml-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl text-sm font-medium transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Remove
                            </motion.button>
                          )}
                          <p className="text-xs text-warm-400 mt-1">JPG, PNG up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Baby's name"
                        className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-2">Gender</label>
                      <div className="grid grid-cols-2 gap-2">
                        {GENDER_OPTIONS.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setEditGender(option.value as any)}
                            className={`
                              px-4 py-3 rounded-xl font-medium transition-all
                              ${editGender === option.value
                                ? 'bg-gradient-to-br from-primary-400 to-sunset-400 text-white shadow-warm'
                                : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                              }
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-xl mr-1">{option.icon}</span>
                            <span className="text-sm">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
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

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleSaveProfile}
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
                            Saving...
                          </span>
                        ) : (
                          t('common.save')
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setShowEditForm(false)}
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

      {/* Profile header with animated entrance */}
      <motion.div
        className="glass-dark rounded-3xl shadow-glass p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Profile picture */}
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-200 to-sunset-200 rounded-full overflow-hidden shadow-warm flex-shrink-0"
            animate={baby.profilePicUrl ? {} : {
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {baby.profilePicUrl ? (
              <img src={baby.profilePicUrl} alt={baby.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </motion.div>

          <div className="min-w-0 flex-1">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
                {baby.name}
              </h2>
              <motion.button
                onClick={handleEditClick}
                className="p-2 hover:bg-warm-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            </motion.div>
            <motion.p
              className="text-warm-500 text-sm sm:text-base"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {t('profile.born', { date: format(new Date(baby.dob), 'MMMM d, yyyy', { locale }) })}
            </motion.p>
            <motion.div
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-100 to-sunset-100 rounded-full mt-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <svg className="w-4 h-4 text-primary-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-primary-700">{t('profile.age', { age: currentAge })}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Milestones section */}
      <motion.div
        className="glass-dark rounded-3xl shadow-glass p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl text-warm-800 flex items-center">
            <motion.span
              className="w-8 h-8 bg-gradient-to-br from-primary-400 to-sunset-400 rounded-xl flex items-center justify-center mr-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </motion.span>
            {t('profile.milestones')}
          </h3>
        </div>
        <p className="text-xs text-warm-400 mb-4 italic">{t('profile.milestonesNote')}</p>

        <div className="space-y-3">
          {MILESTONES.map((milestone, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                milestone.achieved
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200'
                  : 'bg-warm-50 border-2 border-warm-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-warm-800">{t(milestone.description)}</p>
                <p className="text-sm text-warm-500">{milestone.age}</p>
              </div>
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  milestone.achieved
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                    : 'bg-warm-200'
                }`}
                animate={milestone.achieved ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: milestone.achieved ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {milestone.achieved ? (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
