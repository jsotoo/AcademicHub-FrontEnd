import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { CreateStudentRequest, Student, StudentDetail, UpdateStudentRequest } from '../models/student.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';

@Service()
export class StudentService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.STUDENTS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<Student[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<Student[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as Student[]))
    }
  
    getById(id: number): Observable<StudentDetail> {
      return this.http
        .get<ApiResult<StudentDetail>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreateStudentRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdateStudentRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }
  }