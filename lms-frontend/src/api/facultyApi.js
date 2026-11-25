import axiosInstance from './axiosInstance';
import { extractArrayPayload, extractPayload } from './responseNormalizer';

export async function getAllFaculty(signal) {
  const response = await axiosInstance.get('/faculty', { signal });
  return extractArrayPayload(response, 'faculties');
}

export async function getFacultyById(id, signal) {
  try {
    const response = await axiosInstance.get(`/faculty/${id}`, { signal });
    const faculty = extractPayload(response, 'faculty');
    if (faculty && faculty._id) return faculty;
  } catch (error) {
    if (error.isCanceled) throw error;
    // Backend getFacultyById signature (id, res, req, res_inner) throws when called via Express router.
    // Fall back to list lookup so editing works cleanly without modifying backend.
    if (error.status !== 500 && !error.isNetworkError) throw error;
    if (error.isNetworkError) throw error;
  }

  const allFaculty = await getAllFaculty(signal);
  const found = allFaculty.find((item) => item._id === id);
  if (!found) {
    throw { status: 404, message: 'Faculty member not found' };
  }
  return found;
}

export async function createFaculty(data) {
  const response = await axiosInstance.post('/faculty', data);
  return {
    message: response.data?.message || 'Faculty created successfully',
    faculty: extractPayload(response, 'user'),
  };
}

export async function updateFaculty(id, data) {
  const response = await axiosInstance.put(`/faculty/${id}`, data);
  return {
    message: response.data?.message || 'Faculty updated successfully',
    faculty: extractPayload(response, 'updated_user'),
  };
}

export async function deleteFaculty(id) {
  const response = await axiosInstance.delete(`/faculty/${id}`);
  return {
    message: response.data?.message || 'Faculty deleted successfully',
  };
}
