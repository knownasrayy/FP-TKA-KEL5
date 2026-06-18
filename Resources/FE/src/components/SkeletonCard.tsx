import { memo } from "react";

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="group relative rounded-2xl bg-card border border-border/60 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-secondary" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-2 w-1/3 bg-secondary rounded-full" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-secondary rounded-full" />
          <div className="h-3 w-4/5 bg-secondary rounded-full" />
        </div>
        
        {/* Rating */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="size-3 bg-secondary rounded-full" />
          ))}
        </div>
        
        {/* Price */}
        <div className="h-4 w-1/2 bg-secondary rounded-full mt-2" />
      </div>
    </div>
  );
});
