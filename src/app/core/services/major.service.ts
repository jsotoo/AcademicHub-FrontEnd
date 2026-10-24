import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';

import { Major, UpdateMajorRequest, CreateMajorRequest, MajorDetail } from '../models/major.model';

@Service()
export class MajorService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.MAJORS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<Major[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<Major[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as Major[]))
    }
  
    getById(id: number): Observable<MajorDetail> {
      return this.http
        .get<ApiResult<MajorDetail>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreateMajorRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdateMajorRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }
  }