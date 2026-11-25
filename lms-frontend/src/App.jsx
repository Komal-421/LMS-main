import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/ToastContainer';
import Login from './pages/Login';
import { ROLES } from './utils/permissions';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

const FacultyList = lazy(() => import('./pages/admin/FacultyList'));
const FacultyForm = lazy(() => import('./pages/admin/FacultyForm'));
const StudentList = lazy(() => import('./pages/admin/StudentList'));
const StudentForm = lazy(() => import('./pages/admin/StudentForm'));
const CourseList = lazy(() => import('./pages/admin/CourseList'));
const CourseForm = lazy(() => import('./pages/admin/CourseForm'));

const FacultyMyCourses = lazy(() => import('./pages/faculty/MyCourses'));
const FacultyCourseDetails = lazy(() => import('./pages/faculty/CourseDetails'));

const StudentMyCourses = lazy(() => import('./pages/student/MyCourses'));
const StudentCourseDetails = lazy(() => import('./pages/student/CourseDetails'));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin routes */}
            <Route
              path="/admin/faculty"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <FacultyList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/faculty/new"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <FacultyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/faculty/:id/edit"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <FacultyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <StudentList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/students/new"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <StudentForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/students/:id/edit"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <StudentForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <CourseList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/courses/new"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <CourseForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/courses/:id/edit"
              element={
                <PrivateRoute roles={[ROLES.ADMIN]}>
                  <CourseForm />
                </PrivateRoute>
              }
            />

            {/* Faculty routes */}
            <Route
              path="/faculty/courses"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <FacultyMyCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/all-courses"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <CourseList />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/courses/new"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <CourseForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/courses/:id"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <FacultyCourseDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/courses/:id/edit"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <CourseForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <StudentList />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/students/new"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <StudentForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/faculty"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <FacultyList />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/faculty/new"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <FacultyForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/faculty/:id/edit"
              element={
                <PrivateRoute roles={[ROLES.FACULTY]}>
                  <FacultyForm />
                </PrivateRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/courses"
              element={
                <PrivateRoute roles={[ROLES.STUDENT]}>
                  <StudentMyCourses />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/courses/:id"
              element={
                <PrivateRoute roles={[ROLES.STUDENT]}>
                  <StudentCourseDetails />
                </PrivateRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
