import { Info } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import Table from '../../components/Table';
import { useAuthState } from '../../context/AuthContext';
import { useTableData } from '../../hooks/useTableData';
import { fetchCourses } from '../../store/slices/coursesSlice';

const SEARCH_FIELDS = ['courseCode', 'courseName', 'department', 'description'];

export default function StudentMyCourses() {
  const { user } = useAuthState();
  const dispatch = useDispatch();
  const { items: allCourses, status, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const { courses, usedDepartmentFallback } = useMemo(() => {
    const hasEnrollmentField = allCourses.some(
      (c) => Array.isArray(c.enrolledStudents) && c.enrolledStudents.length > 0
    );
    if (hasEnrollmentField) {
      return {
        courses: allCourses.filter(
          (c) =>
            Array.isArray(c.enrolledStudents) &&
            c.enrolledStudents.some((s) => s === user?._id || s?._id === user?._id)
        ),
        usedDepartmentFallback: false,
      };
    }
    return {
      courses: allCourses.filter(
        (c) => c.department?.toLowerCase() === user?.department?.toLowerCase()
      ),
      usedDepartmentFallback: true,
    };
  }, [allCourses, user]);

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
  } = useTableData(courses, {
    searchFields: SEARCH_FIELDS,
    initialSortKey: 'courseCode',
  });

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
        key: 'actions',
        label: 'Details',
        render: (row) => (
          <Link to={`/student/courses/${row._id}`}>
            <Button size="sm" variant="secondary">
              View Course
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Courses available in your enrollment / academic department.
        </p>
      </div>

      {usedDepartmentFallback && allCourses.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <span>
            Showing courses for your department (<strong>{user?.department}</strong>), as
            the backend Course model does not currently maintain an{' '}
            <code>enrolledStudents</code> array.
          </span>
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search courses..."
      />

      <Table
        columns={columns}
        data={paginatedItems}
        loading={status === 'loading'}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyTitle="No courses found"
        emptyDescription="No courses are currently available for your department."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
