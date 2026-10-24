import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/paged.model';
import { CreateScheduleRequest, Schedule, UpdateScheduleRequest } from '../models/schedule.model';

@Service()
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.SCHEDULES.BASE).url;
  }

  list(request: PagedRequest): Observable<Schedule[]> {
    const params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    return this.http
      .get<ApiResult<Schedule[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? []));
  }

  getById(id: number): Observable<Schedule> {
    return this.http
      .get<ApiResult<Schedule>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  create(request: CreateScheduleRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(this.baseUrl, request);
  }

  update(id: number, request: UpdateScheduleRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
