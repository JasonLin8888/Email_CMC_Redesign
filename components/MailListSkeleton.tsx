export function MailListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto py-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-4 py-3 mx-2 my-0.5 rounded-lg bg-gray-50 animate-pulse"
        >
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-32 h-3 bg-gray-200 rounded" />
          <div className="w-40 h-3 bg-gray-200 rounded" />
          <div className="flex-1 h-3 bg-gray-200 rounded" />
          <div className="w-12 h-3 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
