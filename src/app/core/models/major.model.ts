import {BaseEntity} from "./base-entity.model";

//Respuesta del listado: GET /api/students?PageNumber=&PageSize=&Search=

export interface Major extends BaseEntity {
    name: string;
    description: string;
    code: string;
}

export interface MajorDetail extends Major {
    id: number;
    name: string;
    description: string;
    code: string;
    createdBy: string;
    createdAt: Date;
}

export interface CreateMajorRequest
{
    name: string;
    description: string;
    code: string;
}

export interface UpdateMajorRequest
{
    name: string;
    description: string;
    code: string;
    
}
