import { RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateFaculty } from '../api/facultyApi';
import { extractErrorMessage } from '../api/responseNormalizer';
import { updateStudent } from '../api/studentApi';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuthActions, useAuthState } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { capitalize, formatDate, getStatusBadgeClasses } from '../utils/formatters';
import { isStudent } from '../utils/permissions';

export default function Profile() {
  const { user, role } = useAuthState();
  const { setUser, refreshUser } = useAuthActions();
  const toast = useToast();

  const studentRole = isStudent(role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      phone: '',
      address: '',
      name: '',
      department: '',
      experience: 0,
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      phone: user.phone != null ? String(user.phone) : '',
      address: user.address || '',
      name: user.name || '',
      department: user.department || '',
      experience: user.experience ?? 0,
    });
  }, [user, reset]);

  const onSubmit = async (values) => {
    if (!user?._id) return;
    try {
      if (studentRole) {
        // Students may only edit phone and address (per guide + backend checkUpdates middleware)
        const payload = {
          phone: Number(values.phone),
          address: values.address.trim(),
        };
        const res = await updateStudent(user._id, payload);
        if (res.student) {
          setUser(res.student);
        } else {
          setUser((prev) => ({ ...prev, ...payload }));
        }
        toast.success(res.message || 'Profile updated successfully.');
      } else {
        const payload = {
          name: values.name.trim(),
          department: values.department.trim(),
          experience: Number(values.experience),
        };
        const res = await updateFaculty(user._id, payload);
        if (res.faculty) {
          setUser(res.faculty);
        } else {
          setUser((prev) => ({ ...prev, ...payload }));
        }
        toast.success(res.message || 'Profile updated successfully.');
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update profile.'));
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Account details loaded from your authenticated session.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={refreshUser}>
          <RefreshCw className="h-4 w-4" />
          Refresh Profile
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {capitalize(user.role)}
            </span>
            {user.status && (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClasses(
                  user.status
                )}`}
              >
                {capitalize(user.status)}
              </span>
            )}
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Department
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {user.department || '—'}
            </dd>
          </div>

          {studentRole ? (
            <>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Enrollment Number
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {user.enrollment_no ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(user.dob)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Gender
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {user.gender || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Admission Date
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(user.admissionDate)}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Employee ID
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {user.employeeId || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Experience
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {user.experience != null ? `${user.experience} years` : '—'}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4"
        noValidate
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Edit Permitted Profile Fields
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {studentRole
              ? 'Students may update only phone number and address.'
              : 'Update your name, department, or years of experience.'}
          </p>
        </div>

        {studentRole ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              required
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\d{10}$/,
                  message: 'Phone number must be exactly 10 digits',
                },
              })}
            />
            <Input
              label="Address"
              placeholder="Residential address"
              required
              error={errors.address?.message}
              {...register('address', {
                required: 'Address is required',
                minLength: { value: 3, message: 'Address is too short' },
              })}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Full Name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Department"
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
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
