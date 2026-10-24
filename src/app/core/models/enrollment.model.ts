import {BaseEntity} from "./base-entity.model";

/**
 * Fila de la grilla: GET /api/courses?PageNumber=&PageSize=&Search=
 * Es una vista plana que combina Course + Major.
 * Solo se usa para LISTAR, no para el formulario.
 */
export interface Enrollment extends BaseEntity {
    studentCode: string;
    studentName: string;
    majorName: string;
    academicTermName: string;
    enrollmentDate: string;
    totalCredits: number;
    coursesCount: number;
    enrollmentStatus: string;
  }

   
  /** GET /api/enrollments/{id}. El alta solo guarda ids; fecha, créditos y estado los asigna el backend. */
  export interface EnrollmentDetail {
    id: number;
    studentId: number;
    academicTermId: number;
    enrollmentDate: string;
    totalCredits: number;
    enrollmentStatus: string;
  }

  /** POST /api/enrollments */
  export interface CreateEnrollmentRequest {
    studentId: number;
    academicTermId: number;
    enrollmentDate: string;
    totalCredits: number;
    enrollmentStatus: string;
  }

  /** PUT /api/enrollments/{id} */
  export interface UpdateEnrollmentRequest {
    studentId: number;
    academicTermId: number;
    enrollmentDate: string;
    totalCredits: number;
    enrollmentStatus: string;
  }
   
  /** Fila del listado de matriculas (administrador): GET /api/enrollments */
export interface EnrollmentList {
    id: number;
    studentCode: string;
    studentName: string;
    majorName: string;
    academicTermName: string;
    enrollmentDate: string;   // fecha ISO: mostrar con el pipe | date
    totalCredits: number;
    coursesCount: number;
    enrollmentStatus: string;
  }
   
  /** "Mi matricula" (estudiante): GET /api/enrollments/me */
  export interface MySchedule {
    dayOfWeek: number | string;   // System.Text.Json envia el enum como numero (0 = Sunday)
    startTime: string;            // "08:00:00"
    endTime: string;
    classroom: string;
  }
   
  export interface MyEnrollmentCourse {
    detailId: number;
    sectionCode: string;
    courseName: string;
    credits: number;
    teacherName: string;
    schedules: MySchedule[];
  }
   
  export interface MyEnrollment {
    id: number;
    academicTermName: string;
    isCurrentTerm: boolean;
    enrollmentDate: string;
    totalCredits: number;
    enrollmentStatus: string;   // Draft | Confirmed | Cancelled
    courses: MyEnrollmentCourse[];
  }