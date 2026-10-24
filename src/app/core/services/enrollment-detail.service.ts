import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/paged.model';
import { EnrollmentCourseDetail, RegisterEnrollmentCourseRequest } from '../models/enrollment-detail.model';

@Service()
export class EnrollmentDetailService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.ENROLLMENT_DETAILS.BASE).url;
  }

  /** Administrador: líneas de matrícula (curso registrado por un estudiante). */
  list(request: PagedRequest): Observable<EnrollmentCourseDetail[]> {
    const params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    return this.http
      .get<ApiResult<EnrollmentCourseDetail[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? []));
  }

  getById(id: number): Observable<EnrollmentCourseDetail> {
    return this.http
      .get<ApiResult<EnrollmentCourseDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  register(request: RegisterEnrollmentCourseRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(`${this.baseUrl}/register`, request);
  }

  /** Cambia DetailStatus a Dropped y devuelve el cupo. */
  drop(id: number): Observable<ApiResult> {
    return this.http.patch<ApiResult>(`${this.baseUrl}/${id}/drop`, {});
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
