import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn("swift-card space-y-3", className)}>
    <div className="skeleton h-28 rounded-xl" />
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-1/2" />
    <div className="flex justify-between items-center">
      <div className="skeleton h-5 w-16" />
      <div className="skeleton h-8 w-16 rounded-xl" />
    </div>
  </div>
);

export const PharmacySkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn("swift-card flex gap-3", className)}>
    <div className="skeleton w-20 h-20 rounded-xl" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <PharmacySkeleton key={i} />
    ))}
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
