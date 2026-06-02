
/** Base skeleton primitive */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />
);

/** Stat card skeleton used on dashboard and other pages */
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-card p-6 flex flex-col items-center justify-center text-center h-48 border border-teal-50">
    <Skeleton className="h-14 w-14 rounded-full mb-4" />
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-10 w-16" />
  </div>
);

/** Analytics view skeleton (charts and stats) */
export const AnalyticsSkeleton = () => (
  <div className="p-8 space-y-8 bg-teal-50/20">
    <Skeleton className="h-10 w-64 mx-auto mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-teal-50 h-[400px] flex flex-col">
          <Skeleton className="h-6 w-48 mb-6 flex-shrink-0" />
          <Skeleton className="flex-1 w-full" />
        </div>
      ))}
    </div>
  </div>
);

/** Order card skeleton used on Orders page */
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="flex items-start gap-6">
      <Skeleton className="h-20 w-20 rounded-2xl" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-14 w-32 rounded-2xl flex-shrink-0" />
      ))}
    </div>
  </div>
);
