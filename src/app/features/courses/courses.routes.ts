import { Route } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const COURSES_ROUTES = [
    
    {
        path: '',
        loadComponent: () => import('./list/courses-list.page').then(m => m.CoursesListPage)
    },
   
    {
        path: 'new',
        loadComponent: () => import('./form/courses-form.page').then(m => m.CoursesFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/courses-form.page').then(m => m.CoursesFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail/courses-detail.page').then(m => m.CoursesDetailPage),
        canActivate: [roleGuard('admin')]
    },

]