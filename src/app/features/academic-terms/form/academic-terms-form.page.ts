import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AcademicTermService } from '../../../core/services/academicterm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AcademicTerm, CreateAcademicTermRequest, UpdateAcademicTermRequest } from '../../../core/models/academicterm.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-academic-terms-form.page',
  styleUrl: './academic-terms-form.page.scss',
  templateUrl: './academic-terms-form.page.html',
})
export class AcademicTermsFormPage implements OnInit {
  private readonly termService = inject(AcademicTermService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  termId: number | null = null;
  loaded = signal<AcademicTerm | null>(null);
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  get title(): string {
    return this.isEditMode ? 'Edit academic term' : 'Create academic term';
  }

  get description(): string {
    return this.isEditMode
      ? 'Update the name and dates. A closed term cannot be edited.'
      : 'The term is created as Planned. Open it from the list when it should accept enrollments.';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.termId = Number(id);
      this.loadTerm(this.termId);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.loading.set(true);
    const operation$: Observable<unknown> = this.isEditMode
      ? this.termService.update(this.termId!, this.buildRequest(v))
      : this.termService.create(this.buildRequest(v));

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(this.isEditMode ? 'Academic term updated' : 'Academic term created');
        this.router.navigate(['/academic-terms']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.notification.error(err.error?.message ?? err.error?.detail ?? 'Error saving the academic term');
      },
    });
  }

  private loadTerm(id: number): void {
    this.loadingData.set(true);
    this.termService.getById(id).subscribe({
      next: (term) => {
        this.loaded.set(term);
        this.form.patchValue({
          name: term.name,
          startDate: term.startDate?.slice(0, 10) ?? '',
          endDate: term.endDate?.slice(0, 10) ?? '',
        });
        if (term.termStatus === 'Closed') {
          this.form.disable();
        }
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading academic term');
        this.loadingData.set(false);
        this.router.navigate(['/academic-terms']);
      },
    });
  }

  private buildRequest(v: ReturnType<typeof this.form.getRawValue>): CreateAcademicTermRequest & UpdateAcademicTermRequest {
    return {
      name: v.name!,
      startDate: v.startDate!,
      endDate: v.endDate!,
    };
  }
}
