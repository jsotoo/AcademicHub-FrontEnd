import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { NotificationService } from '../../../core/services/notification.service';
import { EnrollmentDetailService } from '../../../core/services/enrollment-detail.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SectionService } from '../../../core/services/section.service';
import { StudentService } from '../../../core/services/student.service';
import { EnrollmentCourseDetail } from '../../../core/models/enrollment-detail.model';
import { SectionDetail } from '../../../core/models/section.model';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-enrollment-details-detail.page',
  styleUrl: './enrollment-details-detail.page.scss',
  templateUrl: './enrollment-details-detail.page.html',
})
export class EnrollmentDetailsDetailPage implements OnInit {
  private readonly detailService = inject(EnrollmentDetailService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly sectionService = inject(SectionService);
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  detail = signal<EnrollmentCourseDetail | null>(null);
  studentCode = signal('');
  studentName = signal('');
  majorName = signal('');
  termName = signal('');
  section = signal<SectionDetail | null>(null);

  detailTitle(): string {
    return this.studentName() || 'Enrollment detail';
  }

  initials(): string {
    const parts = this.studentName().split(' ').filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'E';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid enrollment detail');
      return;
    }

    this.detailService.getById(id).pipe(
      switchMap((detail) => forkJoin({
        detail: of(detail),
        enrollment: this.enrollmentService.getById(detail.enrollmentId),
        section: this.sectionService.getById(detail.sectionId),
      })),
      switchMap(({ detail, enrollment, section }) =>
        this.studentService.getById(enrollment.studentId).pipe(
          map((student) => ({ detail, section, student })),
        ),
      ),
    ).subscribe({
      next: ({ detail, section, student }) => {
        this.detail.set(detail);
        this.section.set(section);
        this.termName.set(section.academicTermName);
        this.studentCode.set(student.code);
        this.studentName.set(`${student.firstName} ${student.lastName}`.trim());
        this.majorName.set(student.majorName);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading enrollment detail');
        this.loadingData.set(false);
      },
    });
  }
}
