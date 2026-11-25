import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import { extractErrorMessage } from '../../api/responseNormalizer';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { CardGridSkeleton } from '../../components/SkeletonLoader';
import { useAuthState } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addCourse, editCourse } from '../../store/slices/coursesSlice';
import { fetchFaculty } from '../../store/slices/facultySlice';
import { isAdmin } from '../../utils/permissions';

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { role } = useAuthState();
  const listPath = isAdmin(role) ? '/admin/courses' : '/faculty/all-courses';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const cachedCourse = useSelector((state) =>
    state.courses.items.find((c) => c._id === id)
  );
  const facultyItems = useSelector((state) => state.faculty.items);

  const [loadingRecord, setLoadingRecord] = useState(isEdit && !cachedCourse);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Populate department options from GET /api/faculty (per guide Important Note #5)
  const departmentOptions = useMemo(() => {
    const unique = Array.from(
      new Set(facultyItems.map((f) => f.department).filter(Boolean))
    ).sort();
    return unique.map((dept) => ({ value: dept, label: dept }));
  }, [facultyItems]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      courseCode: '',
      courseName: '',
      department: '',
      semester: 1,
      description: '',
    },
  });

  useEffect(() => {
    dispatch(fetchFaculty());
  }, [dispatch]);

  useEffect(() => {
    if (!isEdit) return;
    if (cachedCourse) {
      reset({
        courseCode: cachedCourse.courseCode || '',
        courseName: cachedCourse.courseName || '',
        department: cachedCourse.department || '',
        semester: cachedCourse.semester ?? 1,
        description: cachedCourse.description || '',
      });
      return;
    }

    const controller = new AbortController();
    getCourseById(id, controller.signal)
      .then((data) => {
        reset({
          courseCode: data.courseCode || '',
          courseName: data.courseName || '',
          department: data.department || '',
          semester: data.semester ?? 1,
          description: data.description || '',
        });
      })
      .catch((err) => {
        if (!err.isCanceled) {
          setLoadError(extractErrorMessage(err, 'Failed to load course.'));
        }
      })
      .finally(() => setLoadingRecord(false));

    return () => controller.abort();
  }, [isEdit, id, cachedCourse, reset]);

  const onSubmit = async (values) => {
    setSubmitError('');
    const payload = {
      courseCode: values.courseCode.trim(),
      courseName: values.courseName.trim(),
      department: values.department.trim(),
      semester: Number(values.semester),
      description: values.description.trim(),
    };

    try {
      if (isEdit) {
        await dispatch(editCourse({ id, data: payload })).unwrap();
        toast.success('Course updated successfully.');
      } else {
        await dispatch(addCourse(payload)).unwrap();
        toast.success('Course created successfully.');
      }
      navigate(listPath);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Failed to save course.'));
    }
  };

  if (loadingRecord) return <CardGridSkeleton count={2} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to={listPath}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Course' : 'Create Course'}
        </h1>
      </div>

      {loadError && <ErrorBanner message={loadError} />}
      {submitError && <ErrorBanner message={submitError} />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Course Code"
            placeholder="CS101"
            required
            error={errors.courseCode?.message}
            {...register('courseCode', { required: 'Course code is required' })}
          />
          <Input
            label="Course Name"
            placeholder="Data Structures & Algorithms"
            required
            error={errors.courseName?.message}
            {...register('courseName', { required: 'Course name is required' })}
          />

          {departmentOptions.length > 0 ? (
            <Select
              label="Department (from Faculty)"
              placeholder="Select department"
              options={departmentOptions}
              required
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />
          ) : (
            <Input
              label="Department"
              placeholder="Computer Science"
              helperText="No faculty departments loaded yet; enter department name."
              required
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />
          )}

          <Input
            label="Semester"
            type="number"
            min={1}
            max={12}
            required
            error={errors.semester?.message}
            {...register('semester', {
              required: 'Semester is required',
              min: { value: 1, message: 'Semester must be at least 1' },
            })}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="course-description"
            className="block text-sm font-medium text-slate-700"
          >
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="course-description"
            rows={4}
            placeholder="Course syllabus overview and objectives..."
            className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
            {...register('description', {
              required: 'Description is required',
            })}
          />
          {errors.description && (
            <p className="text-xs font-medium text-rose-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Link to={listPath}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
