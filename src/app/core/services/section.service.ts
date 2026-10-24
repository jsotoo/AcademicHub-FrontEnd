import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { PagedRequest } from '../models/paged.model';
import { map, Observable } from 'rxjs';
import { ApiResult } from '../models/auth.model';
import { CreateSectionRequest, Section, SectionDetail, UpdateSectionRequest } from '../models/section.model';

@Service()
export class SectionService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
  
    private get baseUrl(): string {
      return this.factory.create(API_ROUTES.SECTIONS.BASE).url;
    }
  
    list(request: PagedRequest): Observable<Section[]> {
  
      const params = new HttpParams()
        .set('pageNumber', request.pageNumber.toString())
        .set('pageSize', request.pageSize.toString())
        .set('search', request.search ?? '');
  
      return this.http
        .get<ApiResult<Section[]>>(this.baseUrl, { params })
        .pipe(
          map((result) => result.value ?? [] as Section[]))
    }
  
    getById(id: number): Observable<SectionDetail> {
      return this.http
        .get<ApiResult<SectionDetail>>(`${this.baseUrl}/${id}`)
        .pipe(
          map((result) => result.value!))
    }
  
    create(request: CreateSectionRequest): Observable<ApiResult> {
      return this.http.post<ApiResult>(this.baseUrl, request);
    }
  
    update(id: number, request: UpdateSectionRequest): Observable<ApiResult> {
      return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
    }
  
    delete(id: number): Observable<ApiResult> {
      return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
    }
  }