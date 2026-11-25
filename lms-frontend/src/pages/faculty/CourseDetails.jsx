import { ArrowLeft, BookOpen, Info, Pencil, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import { extractErrorMessage } from '../../api/responseNormalizer';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import { CardGridSkeleton } from '../../components/SkeletonLoader';
import Table from '../../components/Table';
import { useTableData } from '../../hooks/useTableData';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { capitalize, getStatusBadgeClasses } from '../../utils/formatters';

const STUDENT_SEARCH_FIELDS = ['name', 'email', 'enrollment_no', 'department'];

export default function FacultyCourseDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const studentsState = useSelector((state) => state.students);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourseDetail = useCallback(
    (signal) =>
      getCourseById(id, signal)
        .then((data) => {
          setCourse(data);
          setError('');
        })
        .catch((err) => {
          if (!err.isCanceled) {
            setError(extractErrorMessage(err, 'Failed to load course details.'));
          }
        })
        .finally(() => setLoading(false)),
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCourseDetail(controller.signal);
    dispatch(fetchStudents());
    return () => controller.abort();
  }, [fetchCourseDetail, dispatch]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const { enrolledList, isDepartmentMatched } = useMemo(() => {
    if (Array.isArray(course?.enrolledStudents) && course.enrolledStudents.length > 0) {
      return { enrolledList: course.enrolledStudents, isDepartmentMatched: false };
    }
    if (!course?.department) {
      return { enrolledList: [], isDepartmentMatched: false };
    }
    return {
      enrolledList: studentsState.items.filter(
        (s) => s.department?.toLowerCase() === course.department?.toLowerCase()
      ),
      isDepartmentMatched: true,
    };
  }, [course, studentsState.items]);

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
  } = useTableData(enrolledList, {
    searchFields: STUDENT_SEARCH_FIELDS,
    initialSortKey: 'name',
  });

  const columns = useMemo(
    () => [
      { key: 'enrollment_no', label: 'Enrollment #', sortable: true },
      { key: 'name', label: 'Student Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'phone', label: 'Phone' },
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
    ],
    []
  );

  if (loading) {
    return <CardGridSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/faculty/courses">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Button>
        </Link>
        {course && (
          <Link to={`/faculty/courses/${course._id}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4" />
              Edit Course
            </Button>
          </Link>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      {course && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    {course.courseCode}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Semester {course.semester}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                  {course.courseName}
                </h1>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Department: {course.department}</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {course.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {isDepartmentMatched ? 'Department Students' : 'Enrolled Students'} (
                  {totalItems})
                </h2>
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search students..."
              />
            </div>

            {isDepartmentMatched && (
              <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <span>
                  The backend Course model does not track individual{' '}
                  <code>enrolledStudents</code>; displaying students registered in the{' '}
                  <strong>{course.department}</strong> department.
                </span>
              </div>
            )}

            <Table
              columns={columns}
              data={paginatedItems}
              loading={studentsState.status === 'loading'}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyTitle="No students found"
              emptyDescription="No students match this course's department or search query."
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
        </>
      )}
    </div>
  );
}
