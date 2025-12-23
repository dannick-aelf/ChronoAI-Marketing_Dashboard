interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className = '', style }: SkeletonProps) => {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={style}
    />
  );
};

export const SkeletonCanvas = ({ aspectRatio }: { aspectRatio: '4:5' | '9:16' }) => {
  const canvasSizes = {
    '4:5': { width: 1080, height: 1350 },
    '9:16': { width: 1080, height: 1920 },
  } as const;
  
  const { width, height } = canvasSizes[aspectRatio];
  
  return (
    <div
      className="bg-grey-bg-2 border-2 border-border rounded-lg overflow-hidden"
      style={{
        aspectRatio: `${width} / ${height}`,
        minWidth: '320px',
        width: '100%',
      }}
    >
      <div className="w-full h-full skeleton-shimmer" />
    </div>
  );
};

export const SkeletonSidebar = () => {
  return (
    <aside className="w-64 bg-grey-bg-2 border-r border-border flex flex-col">
      {/* Header Skeleton */}
      <div className="p-6 border-b border-border">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-5 w-40 mb-4" />
        
        {/* Product Selector Skeleton */}
        <Skeleton className="h-11 w-full mb-4" />
        
        {/* Filter Section Skeleton */}
        <div className="mt-4 space-y-4">
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
      
      {/* Actions Skeleton */}
      <div className="p-6 space-y-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </aside>
  );
};

export const SkeletonCanvasGrid = ({ 
  count = 6, 
  aspectRatio = '4:5' 
}: { count?: number; aspectRatio?: '4:5' | '9:16' }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCanvas key={index} aspectRatio={aspectRatio} />
        ))}
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <SkeletonSidebar />
      <SkeletonCanvasGrid />
    </div>
  );
};

