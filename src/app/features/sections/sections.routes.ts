import { Route } from "@angular/router";
import { roleGuard } from "../../core/guards/role.guard";

export const SECTIONS_ROUTES = [
    
    {
        path: '',
        loadComponent: () => import('./list/sections-list.page').then(m => m.SectionsListPage)
    },
   
    {
        path: 'new',
        loadComponent: () => import('./form/sections-form.page').then(m => m.SectionsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./form/sections-form.page').then(m => m.SectionsFormPage),
        canActivate: [roleGuard('admin')]
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail/sections-detail.page').then(m => m.SectionsDetailPage),
        canActivate: [roleGuard('admin')]
    },

]