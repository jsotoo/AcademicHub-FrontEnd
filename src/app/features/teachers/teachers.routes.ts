import { Route } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const TEACHERS_ROUTES = [
    
    {
        path: '',
        loadComponent: () => import('./list/teachers-list.page').then(m => m.TeachersListPage)
    },
   
    {
        path: 'new',
        loadComponent: () => import('./form/teachers-form.page').then(m => m.TeachersFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/teachers-form.page').then(m => m.TeachersFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail/teachers-detail.page').then(m => m.TeachersDetailPage),
        canActivate: [roleGuard('admin')]
    },

]