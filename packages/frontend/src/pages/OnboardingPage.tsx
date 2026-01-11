/**
 * Onboarding Page - First Time User Experience
 *
 * Guides new users through creating their family and first baby profile.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Boy', icon: '👦' },
  { value: 'female', label: 'Girl', icon: '👧' },
];

const STEP_TITLES = ['Welcome!', 'About Your Family', 'Your Baby', 'All Set!'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, createFamily, createBaby } = useAuthStore();

  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyDob, setBabyDob] = useState('');
  const [babyGender, setBabyGender] = useState<'male' | 'female'>('male');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = async () => {
    setError('');
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!familyName.trim()) {
        setError('Please enter a family name');
        return;
      }
      // Create family first
      setIsLoading(true);
      try {
        await createFamily(familyName.trim());
        setStep(2);
      } catch (err: any) {
        setError(err.message || 'Failed to create family');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (!babyName.trim() || !babyDob) {
        setError('Please fill in all fields');
        return;
      }
      await completeOnboarding();
    }
  };

  const prevStep = () => {
    setError('');
    if (step > 0) setStep(step - 1);
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // Create the baby
      await createBaby(babyName.trim(), new Date(babyDob).toISOString(), babyGender);
      setStep(3);

      // Navigate to timeline after a short delay
      setTimeout(() => {
        navigate('/timeline');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-warm" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Background decorations */}
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
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-400 via-sunset-400 to-rose-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-sm text-warm-500 mt-2 font-medium">
            Step {step + 1} of {STEP_TITLES.length}
          </p>
        </div>

        {/* Card */}
        <motion.div
          className="glass-dark rounded-3xl shadow-glass-lg p-8 border border-white/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={step}
        >
          {/* Step title */}
          <motion.h2
            className="font-display font-bold text-2xl text-warm-800 mb-6 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {STEP_TITLES[step]}
          </motion.h2>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-rose-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-primary-400 via-sunset-400 to-rose-400 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-warm-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <p className="text-warm-600 mb-2">
                Welcome to <span className="font-bold text-warm-800">TimeHut</span>!
              </p>
              <p className="text-warm-500 text-sm">
                Let's set up your baby's memory book in just a few steps.
              </p>
            </motion.div>
          )}

          {/* Step 1: Family Name */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <label className="block text-sm font-semibold text-warm-700 mb-2">
                Family Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g., The Smith Family"
                className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                disabled={isLoading}
              />
              <p className="text-xs text-warm-400 mt-2">
                This will be the name for your family group.
              </p>
            </motion.div>
          )}

          {/* Step 2: Baby Info */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Baby's Name
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={babyDob}
                  onChange={(e) => setBabyDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setBabyGender(option.value as 'male' | 'female')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        babyGender === option.value
                          ? 'border-primary-400 bg-primary-50 shadow-warm'
                          : 'border-warm-200 hover:border-warm-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      <span className="text-3xl mb-1 block">{option.icon}</span>
                      <span className="text-sm font-medium text-warm-700">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <p className="text-warm-800 font-bold text-lg mb-2">You're all set!</p>
              <p className="text-warm-500 text-sm">
                Redirecting to your timeline...
              </p>
            </motion.div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <motion.button
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-warm-100 text-warm-700 rounded-xl font-medium hover:bg-warm-200 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              )}
              <motion.button
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary-400 via-sunset-400 to-rose-400 text-white py-3 rounded-xl font-bold shadow-warm hover:shadow-warm-lg disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Saving...
                  </span>
                ) : step === 2 ? 'Finish' : 'Next'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
