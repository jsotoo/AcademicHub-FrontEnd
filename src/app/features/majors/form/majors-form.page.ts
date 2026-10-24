import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
 

import { MajorService } from '../../../core/services/major.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { CreateMajorRequest, Major, UpdateMajorRequest } from '../../../core/models/major.model';


@Component({
  standalone: true,
  selector: 'app-majors-form.page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  styleUrl: './majors-form.page.scss',
  templateUrl: './majors-form.page.html',
})
export class MajorsFormPage implements OnInit {
  // Este formulario solo necesita StudentService y MajorService.
  // Person y User los crea/actualiza el backend dentro de la misma operacion.

  private readonly majorService = inject(MajorService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
 
 
  majors = signal<Major[]>([]);
  isEditMode = false;
  majorId: number | null = null;
  loading = signal(false);
  loadingData = signal(false);

 
  form = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(255)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
  });

  get title(): string {
    return this.isEditMode ? 'Edit Major' : 'Create Major';
  }
 
  get description(): string {
    return this.isEditMode
      ? 'Edit the major information'
      : 'Complete the form to create a new major';
  }
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.majorId = parseInt(id, 10);
      this.loadMajor(this.majorId);
    }
  }

  
  private loadMajor(id: number): void {
    this.loadingData.set(true);
    this.majorService.getById(id).subscribe({
      next: (m: Major) => {
        this.form.patchValue({
          name: m.name,
          description: m.description,
          code: m.code,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading major');
        this.loadingData.set(false);
        this.router.navigate(['/majors']);
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
      ? this.majorService.update(this.majorId!, this.buildUpdateRequest(v))
      : this.majorService.create(this.buildCreateRequest(v));
 
    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(
          this.isEditMode ? 'Major updated successfully' : 'Major created successfully',
        );
        this.router.navigate(['/majors']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // ProblemDetails de ASP.NET usa "detail"; algunos middlewares usan "message"
        const msg = err.error?.detail ?? err.error?.message ?? 'Error saving the major';
        this.notification.error(msg);
      },
    });
  }
 
  private buildCreateRequest(v: ReturnType<typeof this.form.getRawValue>): CreateMajorRequest {
    return {
      name: v.name!,
      description: v.description!,
      code: v.code!,
    };
  }
 
  private buildUpdateRequest(v: ReturnType<typeof this.form.getRawValue>): UpdateMajorRequest {
    return {
      code: v.code!,
      name: v.name!,
      description: v.description!,
     
    };
  }
}
 