import axiosInstance from './axiosInstance';
import { extractArrayPayload, extractPayload } from './responseNormalizer';

export async function getAllCourses(signal) {
  const response = await axiosInstance.get('/courses', { signal });
  return extractArrayPayload(response, 'courses');
}

export async function getCourseById(id, signal) {
  // Backend route is GET /api/courses/:id
  const response = await axiosInstance.get(`/courses/${id}`, { signal });
  return extractPayload(response, 'course');
}

export async function createCourse(data) {
  const response = await axiosInstance.post('/courses', data);
  return {
    message: response.data?.message || 'Course created successfully',
    course: extractPayload(response, 'course'),
  };
}

export async function updateCourse(id, data) {
  const response = await axiosInstance.put(`/courses/${id}`, data);
  return {
    message: response.data?.message || 'Course updated successfully',
    course: extractPayload(response, 'course'),
  };
}

export async function deleteCourse(id) {
  const response = await axiosInstance.delete(`/courses/${id}`);
  return {
    message: response.data?.message || 'Course deleted successfully',
  };
}
