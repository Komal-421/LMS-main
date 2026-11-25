import axiosInstance from './axiosInstance';
import { registerStudentRequest } from './authApi';
import { extractArrayPayload, extractPayload } from './responseNormalizer';

export async function getAllStudents(signal) {
  const response = await axiosInstance.get('/students', { signal });
  return extractArrayPayload(response, 'students');
}

export async function getStudentById(id, signal) {
  try {
    const response = await axiosInstance.get(`/students/${id}`, { signal });
    const student = extractPayload(response, 'student');
    if (student && student._id) return student;
  } catch (error) {
    if (error.isCanceled) throw error;
    // Backend getStudentById signature (id, res, req, res_own) throws 500 when called via Express router.
    // Fall back to list lookup when :id fails with 500 so editing still works cleanly.
    if (error.status !== 500) throw error;
  }

  const allStudents = await getAllStudents(signal);
  const found = allStudents.find((item) => item._id === id);
  if (!found) {
    throw { status: 404, message: 'Student not found' };
  }
  return found;
}

export async function createStudent(data) {
  // Backend registers new students via POST /api/auth/register (no POST /api/students route exists).
  return registerStudentRequest(data);
}

export async function updateStudent(id, data) {
  const response = await axiosInstance.put(`/students/${id}`, data);
  return {
    message: response.data?.message || 'Student updated successfully',
    student: extractPayload(response, 'user'),
  };
}

export async function deleteStudent(id) {
  const response = await axiosInstance.delete(`/students/${id}`);
  return {
    message: response.data?.message || 'Student deleted successfully',
  };
}
