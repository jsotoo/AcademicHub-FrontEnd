import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MatIconModule } from '@angular/material/icon';
import { EnrollmentDetail } from '../../../core/models/enrollment.model';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { StudentService } from '../../../core/services/student.service';
import { AcademicTermService } from '../../../core/services/academicterm.service';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-enrollments-detail.page',
  styleUrl: './enrollments-detail.page.scss',
  templateUrl: './enrollments-detail.page.html',
})
export class EnrollmentsDetailPage implements OnInit {

  private readonly enrollmentService = inject(EnrollmentService);
  private readonly studentService = inject(StudentService);
  private readonly academicTermService = inject(AcademicTermService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  enrollment = signal<EnrollmentDetail | null>(null);
  studentCode = signal('');
  studentName = signal('');
  majorName = signal('');
  termName = signal('');

  detailTitle(): string {
    const name = this.studentName();
    return name ? name : 'Enrollment detail';
  }

  initials(): string {
    const parts = this.studentName().split(' ').filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
    return letters.join('') || 'E';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid enrollment');
      return;
    }

    this.enrollmentService.getById(id).subscribe({
      next: (detail) => {
        this.enrollment.set(detail);
        this.loadingData.set(false);
        this.loadStudent(detail.studentId);
        this.loadTerm(detail.academicTermId);
      },
      error: () => {
        this.notification.error('Error loading enrollment');
        this.loadingData.set(false);
      },
    });
  }

  private loadStudent(id: number): void {
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentCode.set(student.code);
        this.studentName.set(`${student.firstName} ${student.lastName}`.trim());
        this.majorName.set(student.majorName);
      },
    });
  }

  private loadTerm(id: number): void {
    this.academicTermService.getById(id).subscribe({
      next: (term) => this.termName.set(term.name),
    });
  }
}
