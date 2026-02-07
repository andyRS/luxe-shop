const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
    <div className="w-full h-64 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-5 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />
);

const SkeletonProductGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="animate-pulse">
    <div className="flex gap-4 p-4 border-b bg-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonProductDetail = () => (
  <div className="animate-pulse">
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-gray-200 rounded-xl h-[500px]" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-12 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

export { SkeletonCard, SkeletonLine, SkeletonProductGrid, SkeletonTable, SkeletonProductDetail };
export default SkeletonProductGrid;
