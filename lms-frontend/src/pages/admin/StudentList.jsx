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
import { fetchStudents, removeStudent } from '../../store/slices/studentsSlice';
import {
  capitalize,
  formatDate,
  getStatusBadgeClasses,
} from '../../utils/formatters';
import { getPermissions, isAdmin } from '../../utils/permissions';

const SEARCH_FIELDS = ['name', 'email', 'enrollment_no', 'department', 'phone'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'passed out', label: 'Passed Out' },
  { value: 'dropped', label: 'Dropped' },
];

export default function StudentList() {
  const { role } = useAuthState();
  const permissions = useMemo(() => getPermissions(role), [role]);
  const adminUser = isAdmin(role);
  const basePath = adminUser ? '/admin/students' : '/faculty/students';

  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status, error } = useSelector((state) => state.students);

  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const departmentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((s) => s.department).filter(Boolean))
    ).sort();
    return unique.map((d) => ({ value: d, label: d }));
  }, [items]);

  const filterPredicate = useCallback(
    (item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (departmentFilter && item.department !== departmentFilter) return false;
      return true;
    },
    [statusFilter, departmentFilter]
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
      await dispatch(removeStudent(deleteTarget._id)).unwrap();
      toast.success(`Removed student "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to delete student.'));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch, toast]);

  const handleRetry = useCallback(() => {
    dispatch(fetchStudents({ force: true }));
  }, [dispatch]);

  const columns = useMemo(() => {
    const cols = [
      { key: 'enrollment_no', label: 'Enrollment #', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'phone', label: 'Phone' },
      {
        key: 'admissionDate',
        label: 'Admission',
        sortable: true,
        render: (row) => formatDate(row.admissionDate),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (row) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(
              row.status
            )}`}
          >
            {capitalize(row.status || 'active')}
          </span>
        ),
      },
    ];

    if (adminUser) {
      cols.push({
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1.5">
            {permissions.canEditStudent && (
              <Link to={`${basePath}/${row._id}/edit`}>
                <Button size="sm" variant="ghost" aria-label={`Edit ${row.name}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            )}
            {permissions.canDeleteStudent && (
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
      });
    }

    return cols;
  }, [adminUser, basePath, permissions.canDeleteStudent, permissions.canEditStudent]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            {adminUser
              ? 'Manage student enrollments, departments, and status.'
              : 'Read-only student directory with onboarding access.'}
          </p>
        </div>
        {permissions.canCreateStudent && (
          <Link to={`${basePath}/new`}>
            <Button>
              <Plus className="h-4 w-4" />
              Register Student
            </Button>
          </Link>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, enrollment #..."
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="w-full sm:w-48">
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
          <div className="w-full sm:w-44">
            <Select
              aria-label="Filter by status"
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={paginatedItems}
        loading={status === 'loading'}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyTitle="No students found"
        emptyDescription="Register a new student or clear active search filters."
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
        itemName={deleteTarget?.name || 'this student'}
      />
    </div>
  );
}
