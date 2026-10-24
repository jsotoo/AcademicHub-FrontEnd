import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { NotificationService } from '../../../core/services/notification.service';
import { EnrollmentDetailService } from '../../../core/services/enrollment-detail.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SectionService } from '../../../core/services/section.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { Section } from '../../../core/models/section.model';
import { EnrollmentCourseDetail } from '../../../core/models/enrollment-detail.model';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-enrollment-details-form.page',
  styleUrl: './enrollment-details-form.page.scss',
  templateUrl: './enrollment-details-form.page.html',
})
export class EnrollmentDetailsFormPage implements OnInit {
  private readonly detailService = inject(EnrollmentDetailService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly sectionService = inject(SectionService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  enrollments = signal<Enrollment[]>([]);
  sections = signal<Section[]>([]);
  loaded = signal<EnrollmentCourseDetail | null>(null);
  isEditMode = false;
  detailId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    enrollmentId: [null as number | null, Validators.required],
    sectionId: [null as number | null, Validators.required],
  });

  get title(): string {
    return this.isEditMode ? 'Edit enrollment detail' : 'Register course';
  }

  get description(): string {
    return this.isEditMode
      ? 'Student and section of this registered course. Drop withdraws the student from the section.'
      : 'Choose the student enrollment and the section to register.';
  }

  ngOnInit(): void {
    this.loadCatalogs();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.detailId = Number(id);
      this.form.disable();
      this.loadDetail(this.detailId);
    }
  }

  submit(): void {
    if (this.isEditMode || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const enrollmentId = this.form.controls.enrollmentId.value;
    const sectionId = this.form.controls.sectionId.value;
    if (enrollmentId == null || sectionId == null) {
      return;
    }

    this.loading.set(true);
    this.detailService.register({ enrollmentId, sectionId }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Course registered');
        this.router.navigate(['/enrollment-details']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.notification.error(err.error?.message ?? err.error?.detail ?? 'Error registering the course');
      },
    });
  }

  drop(): void {
    if (this.detailId == null) {
      return;
    }

    this.loading.set(true);
    this.detailService.drop(this.detailId).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Course dropped');
        this.router.navigate(['/enrollment-details']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.notification.error(err.error?.message ?? err.error?.detail ?? 'Error dropping the course');
      },
    });
  }

  private loadCatalogs(): void {
    this.enrollmentService.list({ pageNumber: 1, pageSize: 200, search: '' }).subscribe({
      next: (enrollments) => this.enrollments.set(enrollments),
      error: () => this.notification.error('Error loading enrollments'),
    });
    this.sectionService.list({ pageNumber: 1, pageSize: 200, search: '' }).subscribe({
      next: (sections) => this.sections.set(sections),
      error: () => this.notification.error('Error loading sections'),
    });
  }

  private loadDetail(id: number): void {
    this.loadingData.set(true);
    this.detailService.getById(id).subscribe({
      next: (detail) => {
        this.loaded.set(detail);
        this.form.patchValue({
          enrollmentId: detail.enrollmentId,
          sectionId: detail.sectionId,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading enrollment detail');
        this.loadingData.set(false);
        this.router.navigate(['/enrollment-details']);
      },
    });
  }
}
