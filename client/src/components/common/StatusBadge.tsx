import React from 'react';

/**
 * Mapping of status values to Tailwind color classes.
 * Adjust or extend as needed.
 */
const statusMap: Record<string, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  processing: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  shipped: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  delivered: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

/**
 * StatusBadge component renders a badge with colors based on the `status` prop.
 * If the status is not defined in the map, it falls back to a neutral gray style.
 */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const key = status?.toLowerCase() ?? '';
  const styles = statusMap[key] || {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {status}
    </span>
  );
};
