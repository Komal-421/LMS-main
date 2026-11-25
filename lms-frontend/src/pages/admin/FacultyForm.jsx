import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getFacultyById } from '../../api/facultyApi';
import { extractErrorMessage } from '../../api/responseNormalizer';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { CardGridSkeleton } from '../../components/SkeletonLoader';
import { useAuthState } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addFaculty, editFaculty } from '../../store/slices/facultySlice';
import { isAdmin } from '../../utils/permissions';

const ROLE_OPTIONS = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
];

export default function FacultyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { role } = useAuthState();
  const listPath = isAdmin(role) ? '/admin/faculty' : '/faculty/faculty';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const cachedFaculty = useSelector((state) =>
    state.faculty.items.find((f) => f._id === id)
  );

  const [loadingRecord, setLoadingRecord] = useState(isEdit && !cachedFaculty);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      employeeId: '',
      password: '',
      department: '',
      experience: 0,
      role: 'faculty',
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    if (cachedFaculty) {
      reset({
        name: cachedFaculty.name || '',
        email: cachedFaculty.email || '',
        employeeId: cachedFaculty.employeeId || '',
        password: '',
        department: cachedFaculty.department || '',
        experience: cachedFaculty.experience ?? 0,
        role: cachedFaculty.role || 'faculty',
      });
      return;
    }

    const controller = new AbortController();
    getFacultyById(id, controller.signal)
      .then((data) => {
        reset({
          name: data.name || '',
          email: data.email || '',
          employeeId: data.employeeId || '',
          password: '',
          department: data.department || '',
          experience: data.experience ?? 0,
          role: data.role || 'faculty',
        });
      })
      .catch((err) => {
        if (!err.isCanceled) {
          setLoadError(extractErrorMessage(err, 'Failed to load faculty record.'));
        }
      })
      .finally(() => setLoadingRecord(false));

    return () => controller.abort();
  }, [isEdit, id, cachedFaculty, reset]);

  const onSubmit = async (values) => {
    setSubmitError('');
    try {
      if (isEdit) {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          employeeId: values.employeeId.trim(),
          department: values.department.trim(),
          experience: Number(values.experience),
        };
        if (isAdmin(role) && values.role) {
          payload.role = values.role;
        }
        await dispatch(editFaculty({ id, data: payload })).unwrap();
        toast.success('Faculty member updated successfully.');
      } else {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          employeeId: values.employeeId.trim(),
          password: values.password,
          department: values.department.trim(),
          experience: Number(values.experience),
        };
        await dispatch(addFaculty(payload)).unwrap();
        toast.success('Faculty member created successfully.');
      }
      navigate(listPath);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Failed to save faculty member.'));
    }
  };

  if (loadingRecord) return <CardGridSkeleton count={2} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={listPath} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Faculty List
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Faculty Member' : 'Create Faculty Member'}
          </h1>
        </div>
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
            label="Full Name"
            placeholder="Dr. Jane Doe"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane.doe@university.edu"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          <Input
            label="Employee ID"
            placeholder="FAC-1001"
            required
            error={errors.employeeId?.message}
            {...register('employeeId', { required: 'Employee ID is required' })}
          />
          <Input
            label="Department"
            placeholder="Computer Science"
            required
            error={errors.department?.message}
            {...register('department', { required: 'Department is required' })}
          />
          <Input
            label="Experience (Years)"
            type="number"
            min={0}
            required
            error={errors.experience?.message}
            {...register('experience', {
              required: 'Experience is required',
              min: { value: 0, message: 'Experience cannot be negative' },
            })}
          />
          {!isEdit ? (
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          ) : (
            isAdmin(role) && (
              <Select
                label="Role"
                options={ROLE_OPTIONS}
                placeholder=""
                {...register('role')}
              />
            )
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Link to={listPath}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Update Faculty' : 'Create Faculty'}
          </Button>
        </div>
      </form>
    </div>
  );
}
