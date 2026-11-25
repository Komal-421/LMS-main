import axiosInstance from './axiosInstance';
import { extractPayload } from './responseNormalizer';

/**
 * Backend authController.loginUser checks `role === 'faculty'` or `role === 'student'`.
 * Admin users are stored in the Faculty collection with `role: 'admin'`,
 * so an 'admin' login selection maps to 'faculty' for the DB lookup,
 * while the returned JWT + /auth/me preserves the actual 'admin' role.
 */
export async function loginRequest({ email, password, role }, signal) {
  const normalizedRole = role === 'admin' ? 'faculty' : role || 'student';
  const response = await axiosInstance.post(
    '/auth/login',
    {
      email: email.trim(),
      password,
      role: normalizedRole,
    },
    { signal }
  );
  const payload = extractPayload(response);
  return {
    token: payload?.token ?? response.data?.token,
    email: payload?.email ?? response.data?.email,
    user: payload?.user ?? null,
  };
}

export async function getCurrentUserRequest(signal) {
  const response = await axiosInstance.get('/auth/me', { signal });
  return extractPayload(response);
}

export async function registerStudentRequest(studentData) {
  const response = await axiosInstance.post('/auth/register', studentData);
  return {
    message: response.data?.message || 'Student registered successfully',
    student: extractPayload(response, 'user'),
  };
}
