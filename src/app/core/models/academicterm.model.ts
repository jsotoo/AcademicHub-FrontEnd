import { BaseEntity } from './base-entity.model';

/** GET /api/academic-terms. El periodo guarda fechas, no horas. */
export interface AcademicTerm extends BaseEntity {
  name: string;
  startDate: string;
  endDate: string;
  termStatus: string;
}

export interface AcademicTermDetail extends AcademicTerm {}

/** POST /api/academic-terms. El estado inicial lo asigna el servidor (Planned). */
export interface CreateAcademicTermRequest {
  name: string;
  startDate: string;
  endDate: string;
}

/** PUT /api/academic-terms/{id} */
export interface UpdateAcademicTermRequest {
  name: string;
  startDate: string;
  endDate: string;
}
