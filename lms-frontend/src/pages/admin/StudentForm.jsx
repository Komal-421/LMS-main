import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { extractErrorMessage } from '../../api/responseNormalizer';
import { getStudentById } from '../../api/studentApi';
import Button from '../../components/Button';
import ErrorBanner from '../../components/ErrorBanner';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { CardGridSkeleton } from '../../components/SkeletonLoader';
import { useAuthState } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchFaculty } from '../../store/slices/facultySlice';
import { addStudent, editStudent } from '../../store/slices/studentsSlice';
import { toDateInputValue } from '../../utils/formatters';
import { isAdmin } from '../../utils/permissions';

const GENDER_OPTIONS = ['Male', 'Female', 'Others', 'Prefer not to say'];
const TODAY_DATE = new Date().toISOString().slice(0, 10);
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'passed out', label: 'Passed Out' },
  { value: 'dropped', label: 'Dropped' },
];

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { role } = useAuthState();
  const listPath = isAdmin(role) ? '/admin/students' : '/faculty/students';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const cachedStudent = useSelector((state) =>
    state.students.items.find((s) => s._id === id)
  );
  const facultyList = useSelector((state) => state.faculty.items);

  const [loadingRecord, setLoadingRecord] = useState(isEdit && !cachedStudent);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const departmentSuggestions = useMemo(() => {
    const depts = facultyList.map((f) => f.department).filter(Boolean);
    return Array.from(new Set(depts)).sort();
  }, [facultyList]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      dob: '',
      gender: 'Male',
      address: '',
      enrollment_no: '',
      department: '',
      admissionDate: TODAY_DATE,
      status: 'active',
    },
  });

  useEffect(() => {
    dispatch(fetchFaculty());
  }, [dispatch]);

  useEffect(() => {
    if (!isEdit) return;
    if (cachedStudent) {
      reset({
        name: cachedStudent.name || '',
        email: cachedStudent.email || '',
        phone: cachedStudent.phone != null ? String(cachedStudent.phone) : '',
        password: '',
        dob: toDateInputValue(cachedStudent.dob),
        gender: cachedStudent.gender || 'Male',
        address: cachedStudent.address || '',
        enrollment_no:
          cachedStudent.enrollment_no != null
            ? String(cachedStudent.enrollment_no)
            : '',
        department: cachedStudent.department || '',
        admissionDate: toDateInputValue(cachedStudent.admissionDate),
        status: cachedStudent.status || 'active',
      });
      return;
    }

    const controller = new AbortController();
    getStudentById(id, controller.signal)
      .then((data) => {
        reset({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone != null ? String(data.phone) : '',
          password: '',
          dob: toDateInputValue(data.dob),
          gender: data.gender || 'Male',
          address: data.address || '',
          enrollment_no:
            data.enrollment_no != null ? String(data.enrollment_no) : '',
          department: data.department || '',
          admissionDate: toDateInputValue(data.admissionDate),
          status: data.status || 'active',
        });
      })
      .catch((err) => {
        if (!err.isCanceled) {
          setLoadError(extractErrorMessage(err, 'Failed to load student record.'));
        }
      })
      .finally(() => setLoadingRecord(false));

    return () => controller.abort();
  }, [isEdit, id, cachedStudent, reset]);

  const onSubmit = async (values) => {
    setSubmitError('');
    try {
      if (isEdit) {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: Number(values.phone),
          dob: values.dob,
          gender: values.gender,
          address: values.address.trim(),
          enrollment_no: Number(values.enrollment_no),
          department: values.department.trim(),
          admissionDate: values.admissionDate,
          status: values.status,
        };
        await dispatch(editStudent({ id, data: payload })).unwrap();
        toast.success('Student record updated successfully.');
      } else {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: Number(values.phone),
          password: values.password,
          dob: values.dob,
          gender: values.gender,
          address: values.address.trim(),
          enrollment_no: Number(values.enrollment_no),
          department: values.department.trim(),
          admissionDate: values.admissionDate,
        };
        await dispatch(addStudent(payload)).unwrap();
        toast.success('Student registered successfully.');
      }
      navigate(listPath);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Failed to save student record.'));
    }
  };

  if (loadingRecord) return <CardGridSkeleton count={2} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={listPath}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Student List
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Student' : 'Register New Student'}
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
            label="Full Name"
            placeholder="Alex Johnson"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="alex@university.edu"
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
            label="Phone Number"
            type="tel"
            placeholder="10-digit mobile number"
            required
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^\d{10}$/,
                message: 'Phone must be exactly 10 digits',
              },
            })}
          />
          <Input
            label="Enrollment Number"
            type="number"
            placeholder="2026001"
            required
            error={errors.enrollment_no?.message}
            {...register('enrollment_no', {
              required: 'Enrollment number is required',
              min: { value: 1, message: 'Enter a valid enrollment number' },
            })}
          />
          <Input
            label="Department"
            list="student-department-options"
            placeholder="Computer Science"
            required
            error={errors.department?.message}
            {...register('department', { required: 'Department is required' })}
          />
          <datalist id="student-department-options">
            {departmentSuggestions.map((dept) => (
              <option key={dept} value={dept} />
            ))}
          </datalist>

          <Select
            label="Gender"
            options={GENDER_OPTIONS}
            placeholder=""
            required
            error={errors.gender?.message}
            {...register('gender', { required: 'Gender is required' })}
          />

          <Input
            label="Date of Birth"
            type="date"
            required
            error={errors.dob?.message}
            {...register('dob', {
              required: 'Date of birth is required',
              validate: (val) =>
                new Date(val) < new Date() || 'DOB must be in the past',
            })}
          />

          <Input
            label="Admission Date"
            type="date"
            required
            error={errors.admissionDate?.message}
            {...register('admissionDate', {
              required: 'Admission date is required',
              validate: (val) =>
                new Date(val) <= new Date() ||
                'Admission date cannot be in the future',
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
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              placeholder=""
              {...register('status')}
            />
          )}

          <div className="sm:col-span-2">
            <Input
              label="Address"
              placeholder="Street, City, State"
              required
              error={errors.address?.message}
              {...register('address', { required: 'Address is required' })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Link to={listPath}>
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Update Student' : 'Register Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}
