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
import {
  CreateStudentRequest,
  StudentDetail,
  UpdateStudentRequest,
} from '../../../core/models/student.model';
 
@Component({
  standalone: true,
  selector: 'app-students-form.page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  styleUrl: './students-form.page.scss',
  templateUrl: './students-form.page.html',
})
export class StudentsFormPage implements OnInit {
  // Este formulario solo necesita StudentService y MajorService.
  // Person y User los crea/actualiza el backend dentro de la misma operacion.
  private readonly studentService = inject(StudentService);
  private readonly majorService = inject(MajorService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
 
  readonly academicStatuses = ['Active', 'Inactive', 'Graduated'];
 
  majors = signal<Major[]>([]);
  isEditMode = false;
  studentId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);
  hidePassword = signal(true);
 
  form = this.fb.group({
    // Datos de acceso (solo al crear)
    userName: ['', [Validators.required, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
 
    // Datos personales (-> Person)
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    address: ['', [Validators.required, Validators.maxLength(100)]],
 
    // Datos academicos (-> Student)
    code: ['', [Validators.required, Validators.maxLength(20)]],
    majorId: [null as number | null, Validators.required],
    academicStatus: ['Active', Validators.required],
  });
 
  get title(): string {
    return this.isEditMode ? 'Edit Student' : 'Create Student';
  }
 
  get description(): string {
    return this.isEditMode
      ? 'Edit the student information'
      : 'Complete the form to create a new student';
  }
 
  ngOnInit(): void {
    this.loadMajors();
 
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.studentId = parseInt(id, 10);
      this.configureEditMode();
      this.loadStudent(this.studentId);
    } else {
      // Al crear, el estado academico lo asigna el backend ("Active")
      this.form.controls.academicStatus.disable();
    }
  }
 
  /** En edicion no existen usuario/contrasena y el codigo es de solo lectura. */
  private configureEditMode(): void {
    this.form.controls.userName.disable();
    this.form.controls.password.disable();
    this.form.controls.code.disable();
  }
 
  private loadMajors(): void {
    this.majorService.list({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (majors) => this.majors.set(majors),
      error: () => this.notification.error('Error loading majors'),
    });
  }
 
  private loadStudent(id: number): void {
    this.loadingData.set(true);
    this.studentService.getById(id).subscribe({
      next: (s: StudentDetail) => {
        this.form.patchValue({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phoneNumber: s.phoneNumber,
          address: s.address,
          code: s.code,
          majorId: s.majorId,
          academicStatus: s.academicStatus,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading student');
        this.loadingData.set(false);
        this.router.navigate(['/students']);
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
      ? this.studentService.update(this.studentId!, this.buildUpdateRequest(v))
      : this.studentService.create(this.buildCreateRequest(v));
 
    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Student updated successfully' : 'Student created successfully',
        );
        this.router.navigate(['/students']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // ProblemDetails de ASP.NET usa "detail"; algunos middlewares usan "message"
        const msg = err.error?.detail ?? err.error?.message ?? 'Error saving the student';
        this.notification.error(msg);
      },
    });
  }
 
  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateStudentRequest {
    return {
      userName: v.userName!,
      password: v.password!,
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      address: v.address!,
      code: v.code!,
      majorId: v.majorId!,
    };
  }
 
  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateStudentRequest {
    return {
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      address: v.address!,
      majorId: v.majorId!,
      academicStatus: v.academicStatus!,
    };
  }
}
 