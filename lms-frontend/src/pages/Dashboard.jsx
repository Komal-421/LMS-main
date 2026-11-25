import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  Plus,
  Users,
} from 'lucide-react';
import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import { CardGridSkeleton } from '../components/SkeletonLoader';
import { useAuthState } from '../context/AuthContext';
import { fetchCourses } from '../store/slices/coursesSlice';
import { fetchFaculty } from '../store/slices/facultySlice';
import { fetchStudents } from '../store/slices/studentsSlice';
import { capitalize } from '../utils/formatters';
import { isAdmin, isFaculty, isStudent } from '../utils/permissions';

const StatCard = memo(function StatCard({ label, value, icon: Icon, colorClass, to }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:underline">
        <span>View details</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
});

const CourseSummaryCard = memo(function CourseSummaryCard({ course, basePath }) {
  return (
    <Link
      to={`${basePath}/${course._id}`}
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {course.courseCode}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Sem {course.semester}
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {course.courseName}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {course.description || 'No course description provided.'}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>Dept: {course.department}</span>
        <span className="font-medium text-indigo-600">Open →</span>
      </div>
    </Link>
  );
});

export default function Dashboard() {
  const { user, role } = useAuthState();
  const dispatch = useDispatch();

  const coursesState = useSelector((state) => state.courses);
  const studentsState = useSelector((state) => state.students);
  const facultyState = useSelector((state) => state.faculty);

  const adminUser = isAdmin(role);
  const facultyUser = isFaculty(role);
  const studentUser = isStudent(role);

  useEffect(() => {
    dispatch(fetchCourses());
    if (adminUser || facultyUser) {
      dispatch(fetchStudents());
    }
    if (adminUser) {
      dispatch(fetchFaculty());
    }
  }, [dispatch, adminUser, facultyUser]);

  const activeStudentsCount = useMemo(
    () =>
      studentsState.items.filter((s) => (s.status || 'active') === 'active')
        .length,
    [studentsState.items]
  );

  const departmentDistribution = useMemo(() => {
    const counts = new Map();
    for (const course of coursesState.items) {
      const dept = course.department || 'Unassigned';
      counts.set(dept, (counts.get(dept) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [coursesState.items]);

  const relevantCourses = useMemo(() => {
    if (facultyUser) {
      const byInstructor = coursesState.items.filter(
        (c) =>
          c.instructor === user?._id ||
          c.instructor?._id === user?._id
      );
      if (byInstructor.length > 0) return byInstructor;
      return coursesState.items.filter(
        (c) =>
          c.department?.toLowerCase() === user?.department?.toLowerCase()
      );
    }
    if (studentUser) {
      const byEnrollment = coursesState.items.filter(
        (c) =>
          Array.isArray(c.enrolledStudents) &&
          c.enrolledStudents.some(
            (s) => s === user?._id || s?._id === user?._id
          )
      );
      if (byEnrollment.length > 0) return byEnrollment;
      return coursesState.items.filter(
        (c) =>
          c.department?.toLowerCase() === user?.department?.toLowerCase()
      );
    }
    return coursesState.items.slice(0, 6);
  }, [coursesState.items, facultyUser, studentUser, user]);

  const handleRetry = () => {
    dispatch(fetchCourses({ force: true }));
    if (adminUser || facultyUser) dispatch(fetchStudents({ force: true }));
    if (adminUser) dispatch(fetchFaculty({ force: true }));
  };

  const errorMessage =
    coursesState.error ||
    (adminUser || facultyUser ? studentsState.error : null) ||
    (adminUser ? facultyState.error : null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {capitalize(role)} Dashboard ·{' '}
            {user?.department ? `${user.department} Department` : 'Academic Portal'}
          </p>
        </div>

        {(adminUser || facultyUser) && (
          <div className="flex flex-wrap gap-2">
            <Link to={adminUser ? '/admin/courses/new' : '/faculty/courses/new'}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </Link>
            <Link
              to={adminUser ? '/admin/students/new' : '/faculty/students/new'}
            >
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                New Student
              </Button>
            </Link>
          </div>
        )}
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} onRetry={handleRetry} />}

      {adminUser && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Students"
              value={
                studentsState.status === 'loading' && studentsState.items.length === 0
                  ? '—'
                  : studentsState.items.length
              }
              icon={GraduationCap}
              colorClass="bg-indigo-50 text-indigo-600"
              to="/admin/students"
            />
            <StatCard
              label="Active Students"
              value={
                studentsState.status === 'loading' && studentsState.items.length === 0
                  ? '—'
                  : activeStudentsCount
              }
              icon={GraduationCap}
              colorClass="bg-emerald-50 text-emerald-600"
              to="/admin/students"
            />
            <StatCard
              label="Total Faculty"
              value={
                facultyState.status === 'loading' && facultyState.items.length === 0
                  ? '—'
                  : facultyState.items.length
              }
              icon={Users}
              colorClass="bg-amber-50 text-amber-600"
              to="/admin/faculty"
            />
            <StatCard
              label="Total Courses"
              value={
                coursesState.status === 'loading' && coursesState.items.length === 0
                  ? '—'
                  : coursesState.items.length
              }
              icon={BookOpen}
              colorClass="bg-sky-50 text-sky-600"
              to="/admin/courses"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Courses by Department</span>
              </div>
              {departmentDistribution.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">
                  No department data available yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {departmentDistribution.map((entry) => (
                    <li
                      key={entry.department}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-slate-600">
                        {entry.department}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {entry.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Courses
                </h2>
                <Link
                  to="/admin/courses"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  View all courses
                </Link>
              </div>
              {coursesState.status === 'loading' && coursesState.items.length === 0 ? (
                <CardGridSkeleton count={3} />
              ) : relevantCourses.length === 0 ? (
                <EmptyState
                  title="No courses found"
                  description="Create your first course to populate the LMS catalog."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {relevantCourses.slice(0, 4).map((course) => (
                    <CourseSummaryCard
                      key={course._id}
                      course={course}
                      basePath="/admin/courses"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {(facultyUser || studentUser) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {facultyUser ? 'My Courses' : 'My Enrolled Courses'}
            </h2>
            <Link
              to={facultyUser ? '/faculty/courses' : '/student/courses'}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          {coursesState.status === 'loading' && coursesState.items.length === 0 ? (
            <CardGridSkeleton count={3} />
          ) : relevantCourses.length === 0 ? (
            <EmptyState
              title="No courses found"
              description={
                facultyUser
                  ? 'No courses are currently assigned to your account or department.'
                  : 'You are not enrolled in any courses yet.'
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relevantCourses.map((course) => (
                <CourseSummaryCard
                  key={course._id}
                  course={course}
                  basePath={facultyUser ? '/faculty/courses' : '/student/courses'}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
