import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { extractErrorMessage } from '../../api/responseNormalizer';
import Button from '../../components/Button';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import ErrorBanner from '../../components/ErrorBanner';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import Select from '../../components/Select';
import Table from '../../components/Table';
import { useAuthState } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTableData } from '../../hooks/useTableData';
import { fetchFaculty, removeFaculty } from '../../store/slices/facultySlice';
import { capitalize } from '../../utils/formatters';
import { getPermissions, isAdmin } from '../../utils/permissions';

const SEARCH_FIELDS = ['name', 'email', 'employeeId', 'department', 'role'];

export default function FacultyList() {
  const { role } = useAuthState();
  const permissions = useMemo(() => getPermissions(role), [role]);
  const basePath = isAdmin(role) ? '/admin/faculty' : '/faculty/faculty';

  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status, error } = useSelector((state) => state.faculty);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchFaculty());
  }, [dispatch]);

  const departmentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((f) => f.department).filter(Boolean))
    ).sort();
    return unique.map((d) => ({ value: d, label: d }));
  }, [items]);

  const filterPredicate = useCallback(
    (item) => !departmentFilter || item.department === departmentFilter,
    [departmentFilter]
  );

  const {
    searchQuery,
    setSearchQuery,
    sortKey,
    sortOrder,
    handleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useTableData(items, {
    searchFields: SEARCH_FIELDS,
    initialSortKey: 'name',
    filterPredicate,
  });

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(removeFaculty(deleteTarget._id)).unwrap();
      toast.success(`Removed faculty member "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to delete faculty member.'));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch, toast]);

  const handleRetry = useCallback(() => {
    dispatch(fetchFaculty({ force: true }));
  }, [dispatch]);

  const columns = useMemo(
    () => [
      { key: 'employeeId', label: 'Employee ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      {
        key: 'experience',
        label: 'Experience',
        sortable: true,
        render: (row) => `${row.experience ?? 0} yrs`,
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (row) => (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {capitalize(row.role || 'faculty')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1.5">
            {permissions.canEditFaculty && (
              <Link to={`${basePath}/${row._id}/edit`}>
                <Button size="sm" variant="ghost" aria-label={`Edit ${row.name}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            )}
            {permissions.canDeleteFaculty && (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [basePath, permissions.canDeleteFaculty, permissions.canEditFaculty]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage faculty members and academic departments.
          </p>
        </div>
        {permissions.canCreateFaculty && (
          <Link to={`${basePath}/new`}>
            <Button>
              <Plus className="h-4 w-4" />
              Add Faculty
            </Button>
          </Link>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, ID, department..."
        />
        <div className="w-full sm:w-56">
          <Select
            aria-label="Filter by department"
            placeholder="All departments"
            options={departmentOptions}
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        loading={status === 'loading'}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyTitle="No faculty members found"
        emptyDescription="Add a faculty record or clear active search filters."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        itemName={deleteTarget?.name || 'this faculty member'}
      />
    </div>
  );
}
