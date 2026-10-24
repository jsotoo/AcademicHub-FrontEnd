import {BaseEntity} from "./base-entity.model";

/**
 * Fila de la grilla: GET /api/teachers?PageNumber=&PageSize=&Search=
 * Es una vista plana que combina Teacher + Person + Major.
 * Solo se usa para LISTAR, no para el formulario.
 */
export interface Teacher extends BaseEntity {
    fullName: string;
    email: string;
    phoneNumber: string;
    speciality: string;
  }
   
  /**
   * Detalle para rellenar el formulario de edicion: GET /api/teachers/{id}
   * Aqui el nombre viene separado en firstName / lastName.
   */
  export interface TeacherDetail {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    speciality: string;
    userName: string;
    createdBy: string;
    createdAt: string;

  }
   
  /** POST /api/students  ->  el backend crea User + Person + Student en una transaccion */
  export interface CreateTeacherRequest {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    speciality: string;

  }
   
  /** PUT /api/teachers/{id}  ->  el backend actualiza Person + Teacher (usuario no se editan) */
  export interface UpdateTeacherRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    speciality: string;

  }
   