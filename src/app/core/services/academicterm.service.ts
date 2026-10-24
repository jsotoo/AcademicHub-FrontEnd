import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';

import { AcademicTerm, UpdateAcademicTermRequest, CreateAcademicTermRequest, AcademicTermDetail } from '../models/academicterm.model';

@Service()
export class AcademicTermService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.ACADEMIC_TERMS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<AcademicTerm[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<AcademicTerm[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as AcademicTerm[]))
    }
  
    getById(id: number): Observable<AcademicTermDetail> {
      return this.http
        .get<ApiResult<AcademicTermDetail>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreateAcademicTermRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdateAcademicTermRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }

    open(id: number): Observable<ApiResult> {
      return this.http.patch<ApiResult>(`${this.baseUrl}/${id}/open`, {});
    }

    close(id: number): Observable<ApiResult> {
      return this.http.patch<ApiResult>(`${this.baseUrl}/${id}/close`, {});
    }
  }