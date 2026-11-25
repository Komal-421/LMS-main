import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Reusable client-side search, filter, sort, and pagination hook.
 * Used across Student, Faculty, and Course tables because the backend
 * returns full collections without server-side pagination/query parameters.
 */
export function useTableData(
  items = [],
  {
    searchFields = [],
    initialSortKey = '',
    initialSortOrder = 'asc',
    initialPageSize = 10,
    filterPredicate = null,
  } = {}
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const debouncedQuery = useDebounce(searchQuery, 220);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (key) => {
      if (!key) return;
      setSortOrder((prevOrder) =>
        sortKey === key ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'asc'
      );
      setSortKey(key);
      setPage(1);
    },
    [sortKey]
  );

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(Number(newSize));
    setPage(1);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    let result = items;
    if (filterPredicate || normalizedQuery) {
      result = items.filter((item) => {
        if (filterPredicate && !filterPredicate(item)) {
          return false;
        }
        if (!normalizedQuery) return true;
        return searchFields.some((field) => {
          const val = item?.[field];
          return val != null && String(val).toLowerCase().includes(normalizedQuery);
        });
      });
    }

    if (!sortKey) return result;

    return [...result].sort((a, b) => {
      const aVal = a?.[sortKey];
      const bVal = b?.[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, debouncedQuery, searchFields, sortKey, sortOrder, filterPredicate]);

  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, safePage, pageSize]);

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    debouncedQuery,
    sortKey,
    sortOrder,
    handleSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalItems,
    totalPages,
    filteredItems: filteredAndSorted,
    paginatedItems,
  };
}
