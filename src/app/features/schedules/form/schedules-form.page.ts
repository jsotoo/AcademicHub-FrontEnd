import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Section } from '../../../core/models/section.model';
import { CreateScheduleRequest, UpdateScheduleRequest } from '../../../core/models/schedule.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SectionService } from '../../../core/services/section.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-schedules-form.page',
  styleUrl: './schedules-form.page.scss',
  templateUrl: './schedules-form.page.html',
})
export class SchedulesFormPage implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly sectionService = inject(SectionService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly days = DAYS.map((label, value) => ({ label, value }));
  isEditMode = false;
  scheduleId: number | null = null;
  sections = signal<Section[]>([]);
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    sectionId: [null as number | null, Validators.required],
    dayOfWeek: [1, Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    classroom: ['', [Validators.required, Validators.maxLength(50)]],
  });

  get title(): string {
    return this.isEditMode ? 'Edit schedule' : 'Create schedule';
  }

  get description(): string {
    return this.isEditMode
      ? 'Update the day, time and classroom. The section stays the same.'
      : 'Assign a class slot to a section.';
  }

  ngOnInit(): void {
    this.loadSections();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.scheduleId = Number(id);
      this.form.controls.sectionId.disable();
      this.loadSchedule(this.scheduleId);
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
      ? this.scheduleService.update(this.scheduleId!, this.buildUpdate(v))
      : this.scheduleService.create(this.buildCreate(v));

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success(this.isEditMode ? 'Schedule updated' : 'Schedule created');
        this.router.navigate(['/schedules']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.notification.error(err.error?.message ?? err.error?.detail ?? 'Error saving the schedule');
      },
    });
  }

  private loadSections(): void {
    this.sectionService.list({ pageNumber: 1, pageSize: 200, search: '' }).subscribe({
      next: (sections) => this.sections.set(sections),
      error: () => this.notification.error('Error loading sections'),
    });
  }

  private loadSchedule(id: number): void {
    this.loadingData.set(true);
    this.scheduleService.getById(id).subscribe({
      next: (schedule) => {
        const day = typeof schedule.dayOfWeek === 'number'
          ? schedule.dayOfWeek
          : DAYS.indexOf(schedule.dayOfWeek);
        this.form.patchValue({
          sectionId: schedule.sectionId,
          dayOfWeek: day >= 0 ? day : 1,
          startTime: schedule.startTime?.slice(0, 5) ?? '',
          endTime: schedule.endTime?.slice(0, 5) ?? '',
          classroom: schedule.classroom,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading schedule');
        this.loadingData.set(false);
        this.router.navigate(['/schedules']);
      },
    });
  }

  private buildCreate(v: ReturnType<typeof this.form.getRawValue>): CreateScheduleRequest {
    return {
      sectionId: v.sectionId!,
      dayOfWeek: Number(v.dayOfWeek),
      startTime: this.withSeconds(v.startTime!),
      endTime: this.withSeconds(v.endTime!),
      classroom: v.classroom!,
    };
  }

  private buildUpdate(v: ReturnType<typeof this.form.getRawValue>): UpdateScheduleRequest {
    return {
      dayOfWeek: Number(v.dayOfWeek),
      startTime: this.withSeconds(v.startTime!),
      endTime: this.withSeconds(v.endTime!),
      classroom: v.classroom!,
    };
  }

  private withSeconds(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }
}
