import {BaseEntity} from "./base-entity.model";

//Respuesta del listado: GET /api/students?PageNumber=&PageSize=&Search=

export interface Person extends BaseEntity {
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
}

export interface CreatePersonRequest
{
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
}

export interface UpdatePersonRequest
{
    FirstName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
}
