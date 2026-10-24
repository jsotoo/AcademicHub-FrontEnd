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
import { CreateTeacherRequest, TeacherDetail, UpdateTeacherRequest } from '../../../core/models/teacher.model';
import { TeacherService } from '../../../core/services/teacher.service';
 
@Component({
  standalone: true,
  selector: 'app-students-form.page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  styleUrl: './teachers-form.page.scss',
  templateUrl: './teachers-form.page.html',
})
export class TeachersFormPage implements OnInit {
  // Este formulario solo necesita TeacherService.
  // Person y User los crea/actualiza el backend dentro de la misma operacion.
  private readonly teacherService = inject(TeacherService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
 

  isEditMode = false;
  teacherId: number | null = null;
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
    speciality: ['', [Validators.required, Validators.maxLength(100)]],
  });
 
  get title(): string {
    return this.isEditMode ? 'Edit Teacher' : 'Create Teacher';
  }
 
  get description(): string {
    return this.isEditMode
      ? 'Edit the teacher information'
      : 'Complete the form to create a new teacher';
  }
 
  ngOnInit(): void {
 
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.teacherId = parseInt(id, 10);
      this.configureEditMode();
      this.loadTeacher(this.teacherId);
    } 
  }
 
  /** En edicion no existen usuario/contrasena y el codigo es de solo lectura. */
  private configureEditMode(): void {
    this.form.controls.userName.disable();
    this.form.controls.password.disable();
  }
 
  private loadTeacher(id: number): void {
    this.loadingData.set(true);
    this.teacherService.getById(id).subscribe({
      next: (s: TeacherDetail) => {
        this.form.patchValue({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phoneNumber: s.phoneNumber,
          address: s.address,
          speciality: s.speciality,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading teacher');
        this.loadingData.set(false);
        this.router.navigate(['/teachers']);
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
      ? this.teacherService.update(this.teacherId!, this.buildUpdateRequest(v))
      : this.teacherService.create(this.buildCreateRequest(v));
 
    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Teacher updated successfully' : 'Teacher created successfully',
        );
        this.router.navigate(['/teachers']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // ProblemDetails de ASP.NET usa "detail"; algunos middlewares usan "message"
        const msg = err.error?.detail ?? err.error?.message ?? 'Error saving the teacher';
        this.notification.error(msg);
      },
    });
  }
 
  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateTeacherRequest {
    return {
      userName: v.userName!,
      password: v.password!,
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      address: v.address!,
      speciality: v.speciality!,
    };
  }
 
  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateTeacherRequest {
    return {
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      address: v.address!,
      speciality: v.speciality!,
  
    };
  }
}
 