import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
 
import { StudentService } from '../../../core/services/student.service';
import { MajorService } from '../../../core/services/major.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { Major } from '../../../core/models/major.model';
import { CourseDetail, CreateCourseRequest, UpdateCourseRequest } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';

@Component({
  standalone: true,
  selector: 'app-courses-form.page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  styleUrl: './courses-form.page.scss',
  templateUrl: './courses-form.page.html',
})
export class CoursesFormPage implements OnInit {
  // Este formulario solo necesita StudentService y MajorService.
  // Person y User los crea/actualiza el backend dentro de la misma operacion.
  private readonly courseService = inject(CourseService);
  private readonly majorService = inject(MajorService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
 
 
  majors = signal<Major[]>([]);
  isEditMode = false;
  courseId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

 
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    credits: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    majorId: [null as number | null, Validators.required],
  });
 
  get title(): string {
    return this.isEditMode ? 'Edit Course' : 'Create Course';
  }
 
  get description(): string {
    return this.isEditMode
      ? 'Edit the course information'
      : 'Complete the form to create a new course';
  }
 
  ngOnInit(): void {
    this.loadMajors();
 
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.courseId = parseInt(id, 10);
      this.loadCourse(this.courseId);
    }
  }


  private loadMajors(): void {
    this.majorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (majors) => this.majors.set(majors),
      error: () => this.notification.error('Error loading majors'),
    });
  }
 
  private loadCourse(id: number): void {
    this.loadingData.set(true);
    this.courseService.getById(id).subscribe({
      next: (c: CourseDetail) => {
        this.form.patchValue({
          name: c.name,
          credits: c.credits.toString(),
          code: c.code,
          majorId: c.majorId,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading course');
        this.loadingData.set(false);
        this.router.navigate(['/courses']);
      },
    });
  }
 
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    // getRawValue() incluye los controles deshabilitados (code, academicStatus)
    const v = this.form.getRawValue();
    this.loading.set(true);
 
    const operation$: Observable<unknown> = this.isEditMode
      ? this.courseService.update(this.courseId!, this.buildUpdateRequest(v))
      : this.courseService.create(this.buildCreateRequest(v));
 
    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Course updated successfully' : 'Course created successfully',
        );
        this.router.navigate(['/courses']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // ProblemDetails de ASP.NET usa "detail"; algunos middlewares usan "message"
        const msg = err.error?.detail ?? err.error?.message ?? 'Error saving the course';
        this.notification.error(msg);
      },
    });
  }
 
  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateCourseRequest {
    return {
      name: v.name!,
      credits: parseInt(v.credits!, 10),
      code: v.code!,
      majorId: v.majorId!,
    };
  }
 
  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateCourseRequest {
    return {
      code: v.code!,
      name: v.name!,
      credits: parseInt(v.credits!, 10),
      majorId: v.majorId!,
    };
  }
}
 