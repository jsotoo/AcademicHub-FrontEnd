import {BaseEntity} from "./base-entity.model";

/**
 * Fila de la grilla: GET /api/courses?PageNumber=&PageSize=&Search=
 * Es una vista plana que combina Course + Major.
 * Solo se usa para LISTAR, no para el formulario.
 */
export interface Course extends BaseEntity {
    code: string;
    name: string;
    credits: number;
    majorName: string;
  }
   
  /**
   * Detalle para rellenar el formulario de edicion: GET /api/courses/{id}
   */
  export interface CourseDetail {
    id: number;
    code: string;
    name: string;
    credits: number;
    majorId: number;
    majorName: string;
    createdBy: string;
    createdAt: string;
  }
   
  /** POST /api/courses  ->  el backend crea Course en una transaccion */
  export interface CreateCourseRequest {
    name: string;
    credits: number;
    code: string;
    majorId: number;
  }
   
  /** PUT /api/courses/{id}  ->  el backend actualiza Course */
  export interface UpdateCourseRequest {
    code: string;
    name: string;
    credits: number;
    majorId: number;
  }
   