import { Component, computed, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];   // roles que ven este item
}


@Component({
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule],
  standalone: true,
  selector: 'app-sidenav',
  styleUrl: './sidenav.component.scss',
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
 protected  readonly auth = inject(AuthService);
 readonly navItems: NavItem[] = [
   // ---- Administrador ----
   { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['admin'] },
   { label: 'Students', icon: 'students', route: '/students', roles: ['admin'] },
   { label: 'Courses', icon: 'courses', route: '/courses', roles: ['admin'] },
   { label: 'Teachers', icon: 'teachers', route: '/teachers', roles: ['admin'] },
   { label: 'Sections', icon: 'sections', route: '/sections', roles: ['admin'] },
   { label: 'Majors', icon: 'majors', route: '/majors', roles: ['admin'] },
   { label: 'Enrollments', icon: 'enrollments', route: '/enrollments', roles: ['admin'] },
   { label: 'Enrollment details', icon: 'class', route: '/enrollment-details', roles: ['admin'] },
   { label: 'Schedules', icon: 'schedule', route: '/schedules', roles: ['admin'] },
   { label: 'Academic terms', icon: 'calendar_month', route: '/academic-terms', roles: ['admin'] },

   // ---- Estudiante ----
   { label: 'My enrollment', icon: 'assignment', route: '/my-enrollment', roles: ['student'] },
 ];

 /** Solo los items del rol actual. Se recalcula si cambia la sesion. */
 readonly visibleItems = computed(() => {
   const role = this.auth.currentUser()?.role;
   return role ? this.navItems.filter((item) => item.roles.includes(role)) : [];
 });

}
