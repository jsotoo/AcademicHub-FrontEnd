import {BaseEntity} from "./base-entity.model";

/**
 * Fila de la grilla: GET /api/students?PageNumber=&PageSize=&Search=
 * Es una vista plana que combina Student + Person + Major.
 * Solo se usa para LISTAR, no para el formulario.
 */
export interface Student extends BaseEntity {
    code: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    majorName: string;
    academicStatus: string;
  }
   
  /**
   * Detalle para rellenar el formulario de edicion: GET /api/students/{id}
   * Aqui el nombre viene separado en firstName / lastName.
   */
  export interface StudentDetail {
    id: number;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    majorId: number;
    majorName: string;
    academicStatus: string;
    userName: string;
    createdBy: string;
    createdAt: string;

  }
   
  /** POST /api/students  ->  el backend crea User + Person + Student en una transaccion */
  export interface CreateStudentRequest {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    code: string;
    majorId: number;
  }
   
  /** PUT /api/students/{id}  ->  el backend actualiza Person + Student (code y usuario no se editan) */
  export interface UpdateStudentRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    majorId: number;
    academicStatus: string;
  }
   