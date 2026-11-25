import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { fetchCourses, removeCourse } from '../../store/slices/coursesSlice';
import { getPermissions, isAdmin } from '../../utils/permissions';

const SEARCH_FIELDS = ['courseCode', 'courseName', 'department', 'description'];

export default function CourseList() {
  const { role } = useAuthState();
  const permissions = useMemo(() => getPermissions(role), [role]);
  const adminUser = isAdmin(role);
  const basePath = adminUser ? '/admin/courses' : '/faculty/courses';

  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status, error } = useSelector((state) => state.courses);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const departmentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((c) => c.department).filter(Boolean))
    ).sort();
    return unique.map((d) => ({ value: d, label: d }));
  }, [items]);

  const semesterOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((c) => c.semester).filter((s) => s != null))
    ).sort((a, b) => a - b);
    return unique.map((s) => ({ value: String(s), label: `Semester ${s}` }));
  }, [items]);

  const filterPredicate = useCallback(
    (item) => {
      if (departmentFilter && item.department !== departmentFilter) return false;
      if (semesterFilter && String(item.semester) !== semesterFilter) return false;
      return true;
    },
    [departmentFilter, semesterFilter]
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
    initialSortKey: 'courseCode',
    filterPredicate,
  });

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(removeCourse(deleteTarget._id)).unwrap();
      toast.success(`Deleted course "${deleteTarget.courseName}".`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to delete course.'));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch, toast]);

  const handleRetry = useCallback(() => {
    dispatch(fetchCourses({ force: true }));
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        key: 'courseCode',
        label: 'Code',
        sortable: true,
        render: (row) => (
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {row.courseCode}
          </span>
        ),
      },
      { key: 'courseName', label: 'Course Name', sortable: true },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'semester', label: 'Semester', sortable: true },
      {
        key: 'description',
        label: 'Description',
        cellClassName: 'max-w-xs truncate',
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1.5">
            {!adminUser && (
              <Link to={`/faculty/courses/${row._id}`}>
                <Button size="sm" variant="ghost">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
            )}
            {permissions.canEditCourse && (
              <Link to={`${basePath}/${row._id}/edit`}>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Edit ${row.courseName}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            )}
            {permissions.canDeleteCourse && (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setDeleteTarget(row)}
                aria-label={`Delete ${row.courseName}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [adminUser, basePath, permissions.canDeleteCourse, permissions.canEditCourse]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, search, and manage academic courses across departments.
          </p>
        </div>
        {permissions.canCreateCourse && (
          <Link to={`${basePath}/new`}>
            <Button>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by code, name, department..."
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
              aria-label="Filter by semester"
              placeholder="All semesters"
              options={semesterOptions}
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
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
        emptyTitle="No courses found"
        emptyDescription="Create a course or adjust your search criteria."
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
        itemName={deleteTarget?.courseName || 'this course'}
      />
    </div>
  );
}
