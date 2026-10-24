import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/paged.model';
import { CreateEnrollmentRequest, Enrollment, EnrollmentDetail, EnrollmentList, MyEnrollment, UpdateEnrollmentRequest } from '../models/enrollment.model';
 
@Service()
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);
 
  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.ENROLLMENTS.BASE).url;
  }
 
  /** Administrador: listado general con datos legibles. */
  list(request: PagedRequest): Observable<Enrollment[]> {
    const params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString())
      .set('search', request.search ?? '');
    return this.http
      .get<ApiResult<Enrollment[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? []));
  }
 
  /** Estudiante: sus matriculas con los cursos. No se envia ningun Id: el backend lo toma del token. */
  getMine(): Observable<MyEnrollment[]> {
    return this.http
      .get<ApiResult<MyEnrollment[]>>(`${this.baseUrl}/me`)
      .pipe(map((result) => result.value ?? []));
  }

  getById(id: number): Observable<EnrollmentDetail> {
    return this.http
      .get<ApiResult<EnrollmentDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  create(request: CreateEnrollmentRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(this.baseUrl, request);
  }

  update(id: number, request: UpdateEnrollmentRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
 