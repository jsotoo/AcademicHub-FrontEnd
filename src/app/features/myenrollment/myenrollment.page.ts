import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../shared/shared-material.module';
import { NotificationService } from '../../core/services/notification.service';
import { Enrollment, MyEnrollment, MySchedule } from '../../core/models/enrollment.model';
import { EnrollmentService } from '../../core/services/enrollment.service';



const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
@Component({
  imports: [CommonModule, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-myenrollment.page',
  styleUrl: './myenrollment.page.scss',
  templateUrl: './myenrollment.page.html',
})
export class MyenrollmentPage {

private readonly enrollmentService = inject(EnrollmentService);
  private readonly notification = inject(NotificationService);
 

  enrollments = signal<MyEnrollment[]>([]);
  loading = signal(false);
 
  /**
   * Matricula a mostrar: la del periodo abierto.
   * Si el alumno solo tiene periodos cerrados, se muestra la mas reciente
   * para que igual vea sus cursos y horarios.
   */
  current = computed(() => {
    const active = this.enrollments().filter((e) => e.enrollmentStatus !== 'Cancelled');
    return active.find((e) => e.isCurrentTerm)
      ?? [...active].sort((a, b) => b.id - a.id)[0]
      ?? null;
  });
 
  /** Las demas (periodos anteriores o canceladas). */
  history = computed(() => this.enrollments().filter((e) => e !== this.current()));
 
  ngOnInit(): void {
    this.loading.set(true);
    this.enrollmentService.getMine().subscribe({
      next: (data) => {
        this.enrollments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Error loading your enrollment');
      },
    });
  }
 
  formatSchedule(s: MySchedule): string {
    const day = typeof s.dayOfWeek === 'number' ? DAYS[s.dayOfWeek] : s.dayOfWeek;
    return `${day} ${s.startTime.slice(0, 5)}-${s.endTime.slice(0, 5)} · ${s.classroom}`;
  }
 
  statusClass(status: string): string {
    return `status status-${status.toLowerCase()}`;
  }

}
