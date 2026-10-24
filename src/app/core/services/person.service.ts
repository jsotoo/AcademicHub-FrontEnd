import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { CreateStudentRequest, Student, UpdateStudentRequest } from '../models/student.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';
import { CreatePersonRequest, Person, UpdatePersonRequest } from '../models/person.model';

@Service()
export class PersonService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.PERSONS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<Person[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<Person[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as Person[]))
    }
  
    getById(id: number): Observable<Person> {
      return this.http
        .get<ApiResult<Person>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreatePersonRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdatePersonRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }
  }