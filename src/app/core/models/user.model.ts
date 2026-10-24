import {BaseEntity} from "./base-entity.model";

//Respuesta del listado: GET /api/students?PageNumber=&PageSize=&Search=

export interface User extends BaseEntity {
    UserName: string;
    PasswordHash: string;
    Role: string;
}

export interface CreateUserRequest
{
    UserName: string;
    PasswordHash: string;
    Role: string;
}

export interface UpdateUserRequest
{
    UserName: string;
    PasswordHash: string;
    Role: string;    
}
