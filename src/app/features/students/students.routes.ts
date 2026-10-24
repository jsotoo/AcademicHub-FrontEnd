import { Route } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const STUDENTS_ROUTES = [
    
    {
        path: '',
        loadComponent: () => import('./list/students-list.page').then(m => m.StudentsListPage)
    },
   
    {
        path: 'new',
        loadComponent: () => import('./form/students-form.page').then(m => m.StudentsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/students-form.page').then(m => m.StudentsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail/students-detail.page').then(m => m.StudentsDetailPage),
        canActivate: [roleGuard('admin')]
    },

]