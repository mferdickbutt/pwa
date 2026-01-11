/**
 * Growth Tracker Page - Warm Memory Book Design
 *
 * Displays baby's growth data overlaid on WHO percentile charts.
 * Mobile-first design optimized for iOS.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { useGrowthStore } from '../stores/growthStore';
import { getDateFnsLocale } from '../lib/i18n/config';

type Metric = 'weight' | 'height' | 'headCircumference';

export default function GrowthPage() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { babies, user, currentFamilyId } = useAuthStore();
  const { entries, createEntry } = useGrowthStore();
  const currentBaby = babies[0];
  const locale = getDateFnsLocale(i18n.language);

  const [selectedMetric, setSelectedMetric] = useState<Metric>('weight');
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load entries when component mounts
  useEffect(() => {
    if (currentBaby && currentFamilyId) {
      useGrowthStore.getState().loadEntries(currentFamilyId, currentBaby.id!);
    }
  }, [currentBaby, currentFamilyId]);

  const METRIC_CONFIG: Record<Metric, { label: string; unit: string; color: string; icon: string }> = {
    weight: {
      label: t('growth.weight'),
      unit: t('common.kg'),
      color: 'from-blue-400 to-blue-500',
      icon: '⚖️'
    },
    height: {
      label: t('growth.height'),
      unit: t('common.cm'),
      color: 'from-emerald-400 to-emerald-500',
      icon: '📏'
    },
    headCircumference: {
      label: t('growth.headCircumference'),
      unit: t('common.cm'),
      color: 'from-amber-400 to-amber-500',
      icon: '🧠'
    },
  };

  const config = METRIC_CONFIG[selectedMetric];

  const handleSaveEntry = async () => {
    if (!currentBaby || !currentFamilyId || !user) return;

    // Validate at least one field is filled
    if (!weight && !height && !headCircumference) {
      setError('Please enter at least one measurement');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createEntry(
        currentFamilyId,
        currentBaby.id!,
        {
          date: new Date(date).toISOString(),
          weightKg: weight ? parseFloat(weight) : undefined,
          heightCm: height ? parseFloat(height) : undefined,
          headCircumferenceCm: headCircumference ? parseFloat(headCircumference) : undefined,
        },
        user.uid
      );

      // Reset form
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setWeight('');
      setHeight('');
      setHeadCircumference('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentBaby) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-sunset-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-warm-800 mb-2">{t('growth.noBabyProfile')}</h3>
        <p className="text-warm-500">{t('growth.createBabyProfile')}</p>
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
            {t('growth.title')}
          </h2>
          <p className="text-warm-500 text-sm mt-1 font-medium">
            {t('growth.subtitle', { name: currentBaby.name })}
          </p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-400 to-sunset-400 text-white rounded-2xl font-bold shadow-warm hover:shadow-warm-lg press-feedback"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {showAddForm ? t('common.cancel') : t('growth.addEntry')}
        </motion.button>
      </motion.div>

      {/* Metric selector - horizontally scrollable on mobile */}
      <motion.div
        className="flex space-x-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {(Object.keys(METRIC_CONFIG) as Metric[]).map((metric) => (
          <motion.button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`
              px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap min-w-fit
              ${selectedMetric === metric
                ? 'bg-gradient-to-br from-primary-400 to-sunset-400 text-white shadow-warm'
                : 'glass text-warm-700 hover:bg-warm-50'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg mr-2">{METRIC_CONFIG[metric].icon}</span>
            <span>{METRIC_CONFIG[metric].label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Chart placeholder */}
      <motion.div
        className="glass-dark rounded-3xl shadow-glass p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="font-display font-bold text-xl text-warm-800 mb-4">
          {t('growth.chart', { metric: config.label })}
        </h3>
        <div className="h-48 sm:h-64 flex items-center justify-center bg-gradient-to-br from-warm-50 to-warm-100 rounded-2xl border-2 border-dashed border-warm-200">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-warm-200 to-warm-300 rounded-2xl flex items-center justify-center mx-auto mb-3"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-8 h-8 text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.div>
            <p className="text-warm-600 font-medium">{t('growth.chartPlaceholder')}</p>
            <p className="text-xs text-warm-400 mt-1">{t('growth.usingRecharts')}</p>
          </div>
        </div>
      </motion.div>

      {/* Add entry form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="glass-dark rounded-3xl shadow-glass p-6 mb-6"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <h3 className="font-display font-bold text-xl text-warm-800 mb-4">{t('growth.addEntry')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">{t('growth.date')}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-2">{t('growth.weight')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-2">{t('growth.height')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-2">{t('growth.headCircumference')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={headCircumference}
                    onChange={(e) => setHeadCircumference(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-white/80 border-2 border-warm-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none transition-all font-medium text-warm-700 text-sm"
                  />
                </div>
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
              <div className="flex space-x-3">
                <motion.button
                  onClick={handleSaveEntry}
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
                    t('growth.saveEntry')
                  )}
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  disabled={isSaving}
                  className="px-5 py-3 border-2 border-warm-200 text-warm-600 rounded-xl font-semibold hover:bg-warm-50 disabled:opacity-50 press-feedback"
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {t('common.cancel')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data table - responsive */}
      {entries.length > 0 && (
        <motion.div
          className="glass-dark rounded-3xl shadow-glass p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display font-bold text-xl text-warm-800 mb-4">{t('growth.allEntries')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-warm-100">
              <thead className="bg-warm-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-warm-600 uppercase tracking-wider">{t('growth.date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-warm-600 uppercase tracking-wider">{t('growth.weight')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-warm-600 uppercase tracking-wider">{t('growth.height')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-warm-600 uppercase tracking-wider">{t('growth.headCircumference')}</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-warm-100">
                {entries.map((entry, i) => (
                  <tr key={i} className="hover:bg-warm-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-warm-800">
                      {format(new Date(entry.date), 'yyyy-MM-dd', { locale })}
                    </td>
                    <td className="px-4 py-3 text-sm text-warm-700">
                      {entry.weightKg ? `${entry.weightKg} ${t('common.kg')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-warm-700">
                      {entry.heightCm ? `${entry.heightCm} ${t('common.cm')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-warm-700">
                      {entry.headCircumferenceCm ? `${entry.headCircumferenceCm} ${t('common.cm')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
