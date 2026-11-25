import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { memo } from 'react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';

const TableRow = memo(function TableRow({ row, columns, onRowClick }) {
  return (
    <tr
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={`transition-colors hover:bg-slate-50/80 ${
        onRowClick ? 'cursor-pointer' : ''
      }`}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 ${
            col.cellClassName || ''
          }`}
        >
          {col.render ? col.render(row) : (row[col.key] ?? '—')}
        </td>
      ))}
    </tr>
  );
});

const Table = memo(function Table({
  columns = [],
  data = [],
  loading = false,
  rowKey = '_id',
  sortKey = '',
  sortOrder = 'asc',
  onSort,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  emptyAction = null,
}) {
  if (loading && data.length === 0) {
    return <TableSkeleton rows={6} columns={Math.max(columns.length, 4)} />;
  }

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 ${
                      col.headerClassName || ''
                    }`}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900"
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, idx) => (
              <TableRow
                key={row?.[rowKey] ?? row?.id ?? idx}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default Table;
