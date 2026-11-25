import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerStudentRequest } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ErrorBanner from '../components/ErrorBanner';
import { useState } from 'react';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      gender: '',
      phone: '',
      dob: '',
      address: '',
      enrollment_no: '',
      department: '',
      admissionDate: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerStudentRequest(data);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      // Extract a simple message; the backend returns { message }
      const msg = error?.response?.data?.message || 'Registration failed.';
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create Your Account
        </h1>
        {serverError && (
          <div className="mb-4">
            <ErrorBanner message={serverError} />
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="student@uni.edu"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i, message: 'Enter a valid email' },
            })}
          />
          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="********"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          {/* Gender */}
          <Select
            label="Gender"
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            error={errors.gender?.message}
            {...register('gender', { required: 'Gender is required' })}
          />
          {/* Phone */}
          <Input
            label="Phone Number"
            type="tel"
            placeholder="1234567890"
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^[0-9]{10,15}$/, message: 'Enter a valid phone number' },
            })}
          />
          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            error={errors.dob?.message}
            {...register('dob', { required: 'Date of birth is required' })}
          />
          {/* Address */}
          <Input
            label="Address"
            type="text"
            placeholder="123 Main St"
            error={errors.address?.message}
            {...register('address', { required: 'Address is required' })}
          />
          {/* Enrollment Number */}
          <Input
            label="Enrollment No."
            type="text"
            placeholder="2023001"
            error={errors.enrollment_no?.message}
            {...register('enrollment_no', { required: 'Enrollment number is required' })}
          />
          {/* Department */}
          <Input
            label="Department"
            type="text"
            placeholder="Computer Science"
            error={errors.department?.message}
            {...register('department', { required: 'Department is required' })}
          />
          {/* Admission Date */}
          <Input
            label="Admission Date"
            type="date"
            error={errors.admissionDate?.message}
            {...register('admissionDate', { required: 'Admission date is required' })}
          />
          <Button type="submit" loading={isSubmitting} className="w-full py-2.5">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
