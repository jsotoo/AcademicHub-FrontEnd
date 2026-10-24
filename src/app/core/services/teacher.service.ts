import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';
import { CreateTeacherRequest, Teacher, TeacherDetail, UpdateTeacherRequest } from '../models/teacher.model';

@Service()
export class TeacherService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.TEACHERS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<Teacher[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<Teacher[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as Teacher[]))
    }
  
    getById(id: number): Observable<TeacherDetail> {
      return this.http
        .get<ApiResult<TeacherDetail>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreateTeacherRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdateTeacherRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }
  }