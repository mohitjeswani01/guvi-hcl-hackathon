export function SkeletonResult() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-4 w-24" />
        <div className="skeleton-shimmer h-6 w-28 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-20" />
        <div className="skeleton-shimmer h-3 w-full" />
        <div className="skeleton-shimmer h-3 w-5/6" />
        <div className="skeleton-shimmer h-3 w-4/6" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-16" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-7 rounded-full" style={{ width: `${60 + Math.random() * 40}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
