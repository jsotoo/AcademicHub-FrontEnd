import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ACADEMIC_TERMS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./list/academic-terms-list.page').then(m => m.AcademicTermsListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./form/academic-terms-form.page').then(m => m.AcademicTermsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/academic-terms-form.page').then(m => m.AcademicTermsFormPage),
    canActivate: [roleGuard('admin')],
  },
  {
    path: ':id/detail',
    loadComponent: () => import('./detail/academic-terms-detail.page').then(m => m.AcademicTermsDetailPage),
    canActivate: [roleGuard('admin')],
  },
];
