import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const MAJORS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./list/majors-list.page').then(m => m.MajorsListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./form/majors-form.page').then(m => m.MajorsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/majors-form.page').then(m => m.MajorsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./detail/majors-detail.page').then(m => m.MajorsDetailPage),
    canActivate: [roleGuard('admin')],
  },
];
