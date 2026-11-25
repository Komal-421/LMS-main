import { memo } from 'react';

export const TableSkeleton = memo(function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        <div className="grid gap-4 bg-slate-50 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, idx) => (
            <div key={idx} className="h-4 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-4 px-4 py-3.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, colIdx) => (
              <div
                key={colIdx}
                className="h-4 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export const CardGridSkeleton = memo(function CardGridSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
});
