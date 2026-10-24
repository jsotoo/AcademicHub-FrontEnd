/**
 * Fila de GET /api/enrollment-details.
 * La tabla solo guarda ids; el estudiante y el curso se resuelven con enrollment y section.
 */
export interface EnrollmentCourseDetail {
  id: number;
  enrollmentId: number;
  sectionId: number;
  registeredAt: string;
  detailStatus: string;
}

/** Vista del admin: el detalle más el estudiante y la sección. */
export interface EnrollmentCourseRow extends EnrollmentCourseDetail {
  studentCode: string;
  studentName: string;
  majorName: string;
  academicTermName: string;
  sectionCode: string;
  courseName: string;
  teacherName: string;
}

/** POST /api/enrollment-details/register */
export interface RegisterEnrollmentCourseRequest {
  enrollmentId: number;
  sectionId: number;
}
