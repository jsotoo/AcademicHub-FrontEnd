import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const SCHEDULES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./list/schedules-list.page').then(m => m.SchedulesListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./form/schedules-form.page').then(m => m.SchedulesFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/schedules-form.page').then(m => m.SchedulesFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./detail/schedules-detail.page').then(m => m.SchedulesDetailPage),
    canActivate: [roleGuard('admin')],
  },
];
