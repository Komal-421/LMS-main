export const ROLES = Object.freeze({
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
});

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isFaculty(role) {
  return role === ROLES.FACULTY;
}

export function isStudent(role) {
  return role === ROLES.STUDENT;
}

export function isStaff(role) {
  return role === ROLES.ADMIN || role === ROLES.FACULTY;
}

export function getPermissions(role) {
  return {
    canViewFaculty: isStaff(role),
    canCreateFaculty: isStaff(role),
    canEditFaculty: isStaff(role),
    canDeleteFaculty: isAdmin(role), // backend allowRole.js permits DELETE for admin only

    canViewStudents: isStaff(role),
    canCreateStudent: isStaff(role), // POST /api/auth/register
    canEditStudent: isStaff(role),
    canDeleteStudent: isAdmin(role), // backend allowRole.js permits DELETE for admin only

    canViewCourses: Boolean(role),
    canCreateCourse: isStaff(role),
    canEditCourse: isStaff(role),
    canDeleteCourse: isAdmin(role), // backend allowRole.js permits DELETE for admin only
  };
}
