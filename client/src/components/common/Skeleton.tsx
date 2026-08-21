import React from 'react';

/** Base skeleton primitive */
export const Skeleton = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`relative overflow-hidden bg-slate-200/80 rounded ${className ?? ''}`} style={style}>
    <div className="absolute inset-0 animate-shimmer" />
  </div>
);

/** Stat card skeleton used on the main Admin Dashboard */
export const DashboardStatSkeleton = ({ isSpecial, className = '' }: { isSpecial?: boolean; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-card p-4 flex flex-col items-center justify-center text-center h-48 border transition-all duration-300 ${
    isSpecial ? 'border-l-4 border-l-red-500 shadow-sm' : 'border-teal-50'
  } ${className}`}>
    <div className={`mb-3 ${isSpecial ? 'bg-red-50' : 'bg-teal-50'} p-3 rounded-full`}>
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <Skeleton className="h-3 w-24 mb-2 bg-slate-100" />
    <Skeleton className="h-8 w-16 bg-teal-50/50" />
  </div>
);

/** Filter button skeleton used on Orders page */
export const FilterCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[32px] border-2 border-gray-50 shadow-sm text-left flex flex-col justify-between h-[140px]">
    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
      <Skeleton className="h-5 w-5 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-20 bg-slate-100" />
      <Skeleton className="h-6 w-12 bg-slate-100" />
    </div>
  </div>
);

/** Analytics view skeleton (charts and stats) matching actual AnalyticsView layout */
export const AnalyticsSkeleton = () => (
  <div className="p-8 space-y-8 bg-teal-50/20">
    {/* Heading area skeleton */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
      <div className="flex flex-col items-center md:items-start space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-3.5 w-40 rounded" />
      </div>
      <Skeleton className="h-10 w-48 rounded-[24px]" />
    </div>

    {/* Overview Stats: 4 columns matching actual AnalyticsView */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 space-y-3">
          <Skeleton className="h-3.5 w-24 bg-slate-100" />
          <Skeleton className="h-8 w-36 bg-slate-200" />
        </div>
      ))}
    </div>

    {/* Charts grid: 2 columns */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-teal-50 h-[400px] flex flex-col justify-between">
          <Skeleton className="h-4 w-48 mb-6 flex-shrink-0" />
          <div className="flex-1 flex items-end gap-3 px-2 pb-2">
            {Array.from({ length: 8 }).map((_, barIdx) => (
              <div key={barIdx} className="flex-1 flex flex-col justify-end h-full">
                <Skeleton className="w-full bg-teal-50/40 rounded-t-lg" style={{ height: `${Math.max(15, Math.floor(Math.sin((barIdx + i) * 0.8) * 40 + 50))}%` }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Order card skeleton used on Orders page */
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-6">
    <div className="flex flex-col lg:flex-row justify-between gap-8">
      {/* Left Side: Order Info */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Order Items Flow: 2 columns grid matching columns-2 flow */}
        <div className="columns-2 gap-3 mt-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 pr-5 rounded-2xl border border-dashed border-gray-100 bg-gray-50/50 break-inside-avoid">
              <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Action buttons */}
      <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[180px] self-end lg:self-start">
        <Skeleton className="h-10 w-28 lg:w-40 rounded-xl" />
        <Skeleton className="h-10 w-28 lg:w-40 rounded-xl" />
      </div>
    </div>
  </div>
);
