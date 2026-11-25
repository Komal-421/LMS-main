import { GraduationCap, Lock, Mail, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../api/responseNormalizer';
import Button from '../components/Button';
import ErrorBanner from '../components/ErrorBanner';
import Input from '../components/Input';
import Select from '../components/Select';
import { useAuthActions, useAuthState } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
];

export default function Login() {
  const { user, loading: authLoading } = useAuthState();
  const { login } = useAuthActions();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [authLoading, user, navigate, location.state]);

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const loggedInUser = await login(values);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Invalid email or password.'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            LMS Portal Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your courses, academic records, and dashboard
          </p>
        </div>

        {serverError && (
          <div className="mb-4">
            <ErrorBanner message={serverError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="relative">
            <Select
              label="Account Role"
              required
              options={ROLE_OPTIONS}
              placeholder=""
              error={errors.role?.message}
              {...register('role', { required: 'Please select a role' })}
            />
            <UserCheck className="pointer-events-none absolute right-9 top-[38px] h-4 w-4 text-slate-400" />
          </div>

          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu"
              autoComplete="email"
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
            <Mail className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-slate-400" />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
              })}
            />
            <Lock className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-slate-400" />
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="mt-2 w-full py-2.5"
          >
            Sign In
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-slate-600">Don’t have an account? </span>
          <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
}
