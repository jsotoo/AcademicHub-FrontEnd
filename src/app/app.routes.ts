import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ShellComponent } from './layouts/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
//RUTAS PUBLICAS (SIN AUTENTICACION)

{
    path:'login',
    loadComponent: () => 
        import('./features/auth/login/login.page').then(m => m.LoginPage)
},

{
    path:'403',
    loadComponent: () => 
        import('./features/errors/forbidden/forbidden.page').then(m => m.ForbiddenPage)
},

{
    path:'404',
    loadComponent: () => 
        import('./features/errors/notfound/notfound.page').then(m => m.NotfoundPage)
},

// RUTAS PROTEGIDAS (CON AUTENTICACION)

{
    path:'',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
        // --- ADMINISTRADOR ---
        {
            path:'dashboard',
            canActivate: [roleGuard('admin')],
            loadComponent: () => 
                import('./features/dashboard/dashboard.page').then(m => m.DashboardPage)
        },
        {
            path:'students',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES)
        },
        {
            path:'courses',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES)
        },
        {
            path:'teachers',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/teachers/teachers.routes').then(m => m.TEACHERS_ROUTES)
        },
        {
            path:'sections',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/sections/sections.routes').then(m => m.SECTIONS_ROUTES)
        },
        {
            path:'majors',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/majors/majors.routes').then(m => m.MAJORS_ROUTES)
        },
        {
            path:'enrollments',
            canActivate: [roleGuard('admin')],
            loadChildren: () => 
                import('./features/enrollments/enrollments.routes').then(m => m.ENROLLMENTS_ROUTES)
        },
        {
            path: 'academic-terms',
            canActivate: [roleGuard('admin')],
            loadChildren: () =>
                import('./features/academic-terms/academic-terms.routes').then(m => m.ACADEMIC_TERMS_ROUTES)
        },
        {
            path: 'schedules',
            canActivate: [roleGuard('admin')],
            loadChildren: () =>
                import('./features/schedules/schedules.routes').then(m => m.SCHEDULES_ROUTES)
        },
        {
            path: 'enrollment-details',
            canActivate: [roleGuard('admin')],
            loadChildren: () =>
                import('./features/enrollment-details/enrollment-details.routes').then(m => m.ENROLLMENT_DETAILS_ROUTES)
        },

        // ---------- ESTUDIANTE ----------
        {
            path:'my-enrollment',
            canActivate: [roleGuard('student')],
            loadComponent: () =>
                import('./features/myenrollment/myenrollment.page').then(m => m.MyenrollmentPage)
        },


        { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).homeRoute() }
    ]
},

{
    path: '**',
    loadComponent: () => 
        import('./features/errors/notfound/notfound.page').then(m => m.NotfoundPage)
}


];
