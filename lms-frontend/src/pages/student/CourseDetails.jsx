import { ArrowLeft, BookOpen, Building2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import { extractErrorMessage } from '../../api/responseNormalizer';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import { CardGridSkeleton } from '../../components/SkeletonLoader';

export default function StudentCourseDetails() {
  const { id } = useParams();
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
    return () => controller.abort();
  }, [fetchCourseDetail]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError('');
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  if (loading) return <CardGridSkeleton count={2} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/student/courses">
        <Button variant="secondary" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to My Courses
        </Button>
      </Link>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      {course && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {course.courseCode}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Semester {course.semester}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {course.courseName}
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
              <Building2 className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Department / Faculty
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {course.department?.name || course.department || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
              <User className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Instructor
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {course.instructor?.name ||
                    course.instructor ||
                    'Assigned by department'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Course Description</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {course.description || 'No description provided for this course.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
