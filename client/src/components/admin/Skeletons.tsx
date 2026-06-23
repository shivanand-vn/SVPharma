import React from 'react';

/**
 * Premium, production-grade component-specific skeleton loaders matching SV Pharma design system.
 */

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => (
    <div className={`relative overflow-hidden bg-slate-200/80 rounded-2xl ${className}`} style={style}>
        <div className="absolute inset-0 animate-shimmer"></div>
    </div>
);

export const StatsSkeleton: React.FC<{ cardsCount?: number }> = ({ cardsCount = 5 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: cardsCount }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-teal-50 shadow-sm flex flex-col items-center justify-center text-center h-48">
                <Skeleton className="h-14 w-14 rounded-2xl mb-4 bg-teal-50" />
                <Skeleton className="h-3.5 w-24 mb-2 bg-slate-100" />
                <Skeleton className="h-7 w-16 bg-teal-50/50" />
            </div>
        ))}
    </div>
);

interface TableSkeletonProps {
    rowsCount?: number;
    colsCount?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rowsCount = 5, colsCount = 6 }) => (
    <div className="overflow-hidden rounded-3xl border border-teal-50 shadow-xl bg-white">
        <div className="p-6 bg-teal-50/10 border-b border-gray-100 flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full bg-teal-200" />
            <Skeleton className="h-4 w-40 bg-teal-100/50" />
        </div>
        <div className="p-4 space-y-4">
            {/* Headers row */}
            <div className="flex justify-between gap-4 border-b border-gray-100 pb-4 px-2">
                {Array.from({ length: colsCount }).map((_, idx) => (
                    <Skeleton key={idx} className={`h-4 bg-slate-200 ${idx === 0 ? 'w-20' : 'w-24'}`} />
                ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: rowsCount }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex justify-between gap-4 py-3.5 px-2 hover:bg-teal-50/10 transition-colors">
                    {Array.from({ length: colsCount }).map((_, colIdx) => (
                        <Skeleton key={colIdx} className={`h-4 bg-slate-100 ${colIdx === 0 ? 'w-16' : 'w-20'}`} />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const ChartsSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-teal-50 shadow-md h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-4 w-40 bg-slate-200" />
                    <Skeleton className="h-4 w-16 bg-slate-100" />
                </div>
                <div className="flex-1 flex items-end gap-3 px-2 pb-2">
                    {Array.from({ length: 12 }).map((_, barIdx) => (
                        <div key={barIdx} className="flex-1 flex flex-col justify-end h-full">
                            <Skeleton className="w-full bg-teal-50/50 rounded-t-lg" style={{ height: `${Math.max(10, Math.floor(Math.random() * 80))}%` }} />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const FormSkeleton: React.FC = () => (
    <div className="bg-white rounded-3xl p-8 border border-teal-50 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <Skeleton className="h-6 w-6 rounded-lg bg-teal-100" />
            <Skeleton className="h-5 w-48 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-slate-100" />
                    <Skeleton className="h-12 w-full rounded-2xl bg-gray-50 border border-gray-100" />
                </div>
            ))}
        </div>
        <div className="pt-4">
            <Skeleton className="h-14 w-full rounded-2xl bg-teal-600/80" />
        </div>
    </div>
);
