import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { TeacherService } from '../../../core/services/teacher.service';
import { SectionService } from '../../../core/services/section.service';
import { CourseService } from '../../../core/services/course.service';
import { CreateSectionRequest, SectionDetail, UpdateSectionRequest } from '../../../core/models/section.model';
import { Course } from '../../../core/models/course.model';
import { Teacher } from '../../../core/models/teacher.model';
import { AcademicTerm } from '../../../core/models/academicterm.model';
import { AcademicTermService } from '../../../core/services/academicterm.service';
 
@Component({
  standalone: true,
  selector: 'app-sections-form.page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  styleUrl: './sections-form.page.scss',
  templateUrl: './sections-form.page.html',
})
export class SectionsFormPage implements OnInit {


  private readonly sectionService = inject(SectionService);
  private readonly academicTermService = inject(AcademicTermService);
  private readonly courseService = inject(CourseService);
  private readonly teacherService = inject(TeacherService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);


  academicTerms = signal<AcademicTerm[]>([]);
  courses = signal<Course[]>([]);
  teachers = signal<Teacher[]>([]);
  isEditMode = false;
  sectionId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);
  hidePassword = signal(true);
 
  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    courseId: [null as number | null, Validators.required],
    teacherId: [null as number | null, Validators.required],
    academicTermId: [null as number | null, Validators.required],
    maxCapacity: [1, [Validators.required, Validators.min(1)]],
    availableCapacity: [{ value: 0, disabled: true }],
  });
 
  get title(): string {
    return this.isEditMode ? 'Edit Section' : 'Create Section';
  }
 
  get description(): string {
    return this.isEditMode
      ? 'Edit the section information'
      : 'Complete the form to create a new section';
  }
 
  ngOnInit(): void {
    this.loadCourses();
    this.loadTeachers();
    this.loadAcademicTerms();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.sectionId = parseInt(id, 10);
      this.loadSection(this.sectionId);
    } 
  }
 
  private loadCourses(): void {
    this.courseService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (courses) => this.courses.set(courses),
      error: () => this.notification.error('Error loading courses'),
    });
  }
  private loadTeachers(): void {
    this.teacherService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (teachers) => this.teachers.set(teachers),
      error: () => this.notification.error('Error loading teachers'),
    });
  }
  private loadAcademicTerms(): void {
    this.academicTermService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (academicTerms) => this.academicTerms.set(academicTerms),
      error: () => this.notification.error('Error loading academic terms'),
    });
  }



  private loadSection(id: number): void {
    this.loadingData.set(true);
    this.sectionService.getById(id).subscribe({
      next: (s: SectionDetail) => {
        this.form.patchValue({
          code: s.code,
          courseId: s.courseId,
          teacherId: s.teacherId,
          academicTermId: s.academicTermId,
          maxCapacity: s.maxCapacity,
          availableCapacity: s.availableCapacity,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading section');
        this.loadingData.set(false);
        this.router.navigate(['/sections']);
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
      ? this.sectionService.update(this.sectionId!, this.buildUpdateRequest(v))
      : this.sectionService.create(this.buildCreateRequest(v));
 
    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Section updated successfully' : 'Section created successfully',
        );
        this.router.navigate(['/sections']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.detail ?? err.error?.message ?? 'Error saving the section';
        this.notification.error(msg);
      },
    });
  }
 
  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateSectionRequest {
    return {
      code: v.code!,
      courseId: v.courseId!,
      teacherId: v.teacherId!,
      academicTermId: v.academicTermId!,
      maxCapacity: Number(v.maxCapacity),
    };
  }

  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateSectionRequest {
    return {
      code: v.code!,
      courseId: v.courseId!,
      teacherId: v.teacherId!,
      academicTermId: v.academicTermId!,
      maxCapacity: Number(v.maxCapacity),
    };
  }
}
 