import { Route } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const ENROLLMENTS_ROUTES = [
    
    {
        path: '',
        loadComponent: () => import('./list/enrollments-list.page').then(m => m.EnrollmentsListPage)
    },
   
    {
        path: 'new',
        loadComponent: () => import('./form/enrollments-form.page').then(m => m.EnrollmentsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/enrollments-form.page').then(m => m.EnrollmentsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail/enrollments-detail.page').then(m => m.EnrollmentsDetailPage),
        canActivate: [roleGuard('admin')]
    },

]