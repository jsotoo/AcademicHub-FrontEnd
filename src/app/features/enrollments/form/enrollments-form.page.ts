import { Component, inject, OnInit, signal } from '@angular/core';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { StudentService } from '../../../core/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateEnrollmentRequest, EnrollmentDetail, UpdateEnrollmentRequest } from '../../../core/models/enrollment.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Student } from '../../../core/models/student.model';
import { AcademicTerm } from '../../../core/models/academicterm.model';
import { AcademicTermService } from '../../../core/services/academicterm.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-enrollments-form.page',
  styleUrl: './enrollments-form.page.scss',
  templateUrl: './enrollments-form.page.html',
})
export class EnrollmentsFormPage implements OnInit {

  private readonly enrollmentService = inject(EnrollmentService);
  private readonly academicTermService = inject(AcademicTermService);
  private readonly studentService = inject(StudentService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  students = signal<Student[]>([]);
  academicTerms = signal<AcademicTerm[]>([]);
  isEditMode = false;
  enrollmentId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    studentId: [null as number | null, Validators.required],
    academicTermId: [null as number | null, Validators.required],
    enrollmentDate: ['', Validators.required],
    totalCredits: [0, [Validators.required, Validators.min(0)]],
    enrollmentStatus: ['Draft', Validators.required],
  });

  get title(): string {
    return this.isEditMode ? 'Edit enrollment' : 'Create enrollment';
  }

  get description(): string {
    return this.isEditMode
      ? 'Update the student, term, date, credits and status.'
      : 'Complete the form to create a new enrollment.';
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadAcademicTerms();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.enrollmentId = Number(id);
      this.loadEnrollment(this.enrollmentId);
    }
  }

  private loadStudents(): void {
    this.studentService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (students) => this.students.set(students),
      error: () => this.notification.error('Error loading students'),
    });
  }

  private loadAcademicTerms(): void {
    this.academicTermService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (academicTerms) => this.academicTerms.set(academicTerms),
      error: () => this.notification.error('Error loading academic terms'),
    });
  }

  private loadEnrollment(id: number): void {
    this.loadingData.set(true);
    this.enrollmentService.getById(id).subscribe({
      next: (enrollment: EnrollmentDetail) => {
        this.form.patchValue({
          studentId: enrollment.studentId,
          academicTermId: enrollment.academicTermId,
          enrollmentDate: this.toDateInput(enrollment.enrollmentDate),
          totalCredits: enrollment.totalCredits,
          enrollmentStatus: enrollment.enrollmentStatus,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading enrollment');
        this.loadingData.set(false);
        this.router.navigate(['/enrollments']);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.loading.set(true);

    const operation$: Observable<unknown> = this.isEditMode
      ? this.enrollmentService.update(this.enrollmentId!, this.buildUpdateRequest(v))
      : this.enrollmentService.create(this.buildCreateRequest(v));

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Enrollment updated successfully' : 'Enrollment created successfully',
        );
        this.router.navigate(['/enrollments']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.detail ?? err.error?.message ?? err.error?.errors?.[0] ?? 'Error saving the enrollment';
        this.notification.error(typeof msg === 'string' ? msg : 'Error saving the enrollment');
      },
    });
  }

  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateEnrollmentRequest {
    return {
      studentId: v.studentId!,
      academicTermId: v.academicTermId!,
      enrollmentDate: v.enrollmentDate!,
      totalCredits: v.totalCredits!,
      enrollmentStatus: v.enrollmentStatus!,
    };
  }

  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateEnrollmentRequest {
    return {
      studentId: v.studentId!,
      academicTermId: v.academicTermId!,
      enrollmentDate: v.enrollmentDate!,
      totalCredits: v.totalCredits!,
      enrollmentStatus: v.enrollmentStatus!,
    };
  }

  private toDateInput(value: string | null | undefined): string {
    return value ? value.slice(0, 10) : '';
  }
}
