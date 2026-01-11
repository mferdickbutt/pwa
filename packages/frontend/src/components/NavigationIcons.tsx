/**
 * Navigation Icons
 *
 * Animated icons for the bottom navigation bar.
 */

import { motion } from 'framer-motion';

type IconRenderer = (isActive: boolean) => React.ReactNode;

const timelineIcon: IconRenderer = (isActive) => (
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
);

const calendarIcon: IconRenderer = (isActive) => (
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
);

const growthIcon: IconRenderer = (isActive) => (
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
);

const capsulesIcon: IconRenderer = (isActive) => (
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
);

const profileIcon: IconRenderer = (isActive) => (
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
);

export const navIcons = {
  timeline: timelineIcon,
  calendar: calendarIcon,
  growth: growthIcon,
  capsules: capsulesIcon,
  profile: profileIcon,
} as const;

export type NavIconType = keyof typeof navIcons;
