import { BaseEntity } from './base-entity.model';

/** Fila de GET /api/sections */
export interface Section extends BaseEntity {
  code: string;
  courseName: string;
  teacherName: string;
  academicTermName: string;
  maxCapacity: number;
  availableCapacity: number;
}

/** GET /api/sections/{id} */
export interface SectionDetail {
  id: number;
  code: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  academicTermId: number;
  academicTermName: string;
  maxCapacity: number;
  availableCapacity: number;
  createdBy: string;
  createdAt: string;
}

/** POST /api/sections */
export interface CreateSectionRequest {
  code: string;
  courseId: number;
  teacherId: number;
  academicTermId: number;
  maxCapacity: number;
}

/** PUT /api/sections/{id} */
export interface UpdateSectionRequest {
  code: string;
  courseId: number;
  teacherId: number;
  academicTermId: number;
  maxCapacity: number;
}
