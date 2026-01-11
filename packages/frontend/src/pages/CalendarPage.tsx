/**
 * Calendar Page - Warm Memory Book Design
 *
 * Displays a monthly calendar view with moment thumbnails shown directly in date cells.
 */

import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useMomentStore } from '../stores/momentStore';
import { getMonthData, getDateKey } from '../lib/utils/calendar';
import { getDateFnsLocale } from '../lib/i18n/config';

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const { currentFamilyId, babies } = useAuthStore();
  const { moments } = useMomentStore();
  const currentBaby = babies[0];

  const locale = getDateFnsLocale(i18n.language);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigate months
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Get calendar weeks
  const weeks = getMonthData(year, month);

  // Group moments by date key
  const momentsByDate = useMemo(() => {
    const grouped: Record<string, typeof moments> = {};
    moments.forEach((moment) => {
      const key = getDateKey(new Date(moment.dateTaken));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(moment);
    });
    return grouped;
  }, [moments]);

  // Get day names based on locale
  const getDayNames = () => {
    const days: Date[] = [];
    const sunday = new Date(2025, 0, 5); // A Sunday
    for (let i = 0; i < 7; i++) {
      days.push(new Date(2025, 0, 5 + i));
    }
    return days.map((d) => format(d, 'E', { locale }));
  };

  // Short day names (first letter)
  const dayNames = getDayNames().map((d) => d.charAt(0));

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
        <h3 className="font-display font-bold text-xl text-warm-800 mb-2">{t('calendar.noBabyProfile')}</h3>
        <p className="text-warm-500">{t('calendar.createBabyProfile')}</p>
      </motion.div>
    );
  }

  const monthYear = format(currentDate, 'MMMM yyyy', { locale });

  return (
    <div className="relative pb-safe-or-24">
      {/* Animated Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div>
          <h2 className="font-display font-bold text-3xl text-warm-900 tracking-tight">
            {t('calendar.title')}
          </h2>
        </div>
      </motion.div>

      {/* Month navigation card */}
      <motion.div
        className="glass-dark rounded-3xl shadow-glass p-4 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.button
            onClick={prevMonth}
            className="p-2 sm:p-3 hover:bg-warm-100 rounded-xl transition-colors press-feedback"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <h3 className="font-display font-bold text-lg sm:text-xl text-warm-800">{monthYear}</h3>
          <motion.button
            onClick={nextMonth}
            className="p-2 sm:p-3 hover:bg-warm-100 rounded-xl transition-colors press-feedback"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-warm-400 py-1 sm:py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid with moment previews */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dayMoments = momentsByDate[day.dateKey] || [];
              const hasMoments = dayMoments.length > 0;
              const previewMoments = dayMoments.slice(0, 4); // Show up to 4 thumbnails
              const extraCount = dayMoments.length - 4;

              return (
                <motion.button
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    aspect-square rounded-xl sm:rounded-2xl text-sm relative overflow-hidden transition-all duration-200
                    ${day.isCurrentMonth
                      ? 'bg-white hover:bg-primary-50'
                      : 'bg-warm-50/50 hover:bg-warm-100'
                    }
                    ${day.isToday ? 'ring-2 ring-primary-400 ring-offset-2' : ''}
                    ${hasMoments ? 'cursor-pointer shadow-sm hover:shadow-md hover:scale-105' : ''}
                  `}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                >
                  {/* Date number */}
                  <span className={`
                    absolute top-1 left-1.5 z-10 font-semibold text-xs sm:text-sm
                    ${day.isToday ? 'text-primary-600' : day.isCurrentMonth ? 'text-warm-700' : 'text-warm-400'}
                    ${hasMoments ? 'text-white drop-shadow-md' : ''}
                  `}>
                    {day.dayOfMonth}
                  </span>

                  {/* Moment thumbnails overlay */}
                  {hasMoments && (
                    <div className="absolute inset-0 grid grid-cols-2 gap-px bg-warm-200/50">
                      {previewMoments.map((moment, idx) => (
                        <div
                          key={moment.id}
                          className="relative bg-warm-100 overflow-hidden"
                        >
                          {moment.displayUrl ? (
                            <img
                              src={moment.displayUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-sunset-100">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Fill empty slots with gradient */}
                      {previewMoments.length < 4 && (
                        <>
                          {Array.from({ length: 4 - previewMoments.length }).map((_, idx) => (
                            <div
                              key={`empty-${idx}`}
                              className="bg-gradient-to-br from-warm-50 to-warm-100"
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Extra count badge */}
                  {extraCount > 0 && (
                    <div className="absolute bottom-1 right-1 z-10 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
                      <span className="text-xs font-bold text-primary-600">+{extraCount}</span>
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Selected day moments panel */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="glass-dark rounded-3xl shadow-glass p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-display font-bold text-lg sm:text-xl text-warm-800">
                {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale })}
              </h3>
              <motion.button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-warm-100 rounded-xl transition-colors press-feedback"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {momentsByDate[getDateKey(selectedDate)]?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {momentsByDate[getDateKey(selectedDate)]?.map((moment, index) => (
                  <motion.div
                    key={moment.id}
                    className="aspect-square bg-warm-100 rounded-2xl overflow-hidden relative group shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {moment.displayUrl ? (
                      <img
                        src={moment.displayUrl}
                        alt={moment.caption || 'Moment'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-sunset-50">
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {moment.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2">
                          {moment.caption}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-warm-100 rounded-full mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-warm-500 font-medium">{t('calendar.noMomentsOnThisDay')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
