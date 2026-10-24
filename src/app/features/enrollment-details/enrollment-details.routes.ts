import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ENROLLMENT_DETAILS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./list/enrollment-details-list.page').then(m => m.EnrollmentDetailsListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./form/enrollment-details-form.page').then(m => m.EnrollmentDetailsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/enrollment-details-form.page').then(m => m.EnrollmentDetailsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./detail/enrollment-details-detail.page').then(m => m.EnrollmentDetailsDetailPage),
    canActivate: [roleGuard('admin')],
  },
];
