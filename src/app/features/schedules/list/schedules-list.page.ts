import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { Section } from '../../../core/models/section.model';
import { ScheduleRow } from '../../../core/models/schedule.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SectionService } from '../../../core/services/section.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-schedules-list.page',
  styleUrl: './schedules-list.page.scss',
  templateUrl: './schedules-list.page.html',
})
export class SchedulesListPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly sectionService = inject(SectionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['sectionCode', 'courseName', 'dayOfWeek', 'startTime', 'endTime', 'classroom', 'actions'];
  dataSource = new MatTableDataSource<ScheduleRow>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  readonly isAdmin = computed(() => this.auth.isAdmin());

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading.set(true);
    forkJoin({
      schedules: this.scheduleService.list({
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize,
        search: '',
      }),
      sections: this.sectionService.list({ pageNumber: 1, pageSize: 200, search: '' }),
    }).subscribe({
      next: ({ schedules, sections }) => {
        const byId = new Map<number, Section>(sections.map((section) => [section.id, section]));
        this.dataSource.data = schedules.map((schedule) => {
          const section = byId.get(schedule.sectionId);
          return {
            ...schedule,
            sectionCode: section?.code ?? `#${schedule.sectionId}`,
            courseName: section?.courseName ?? '',
          };
        });
        this.totalItems = schedules.length;
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error loading schedules');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSchedules();
  }

  dayName(day: number | string): string {
    const index = typeof day === 'number' ? day : DAYS.indexOf(day);
    return DAYS[index] ?? String(day);
  }

  clock(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  editSchedule(id: number): void {
    this.router.navigate(['/schedules', id, 'edit']);
  }

  confirmDelete(row: ScheduleRow): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete schedule',
        message: `Delete the ${this.dayName(row.dayOfWeek)} class in ${row.classroom}?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.scheduleService.delete(row.id).subscribe({
        next: () => {
          this.notification.success('Schedule deleted');
          this.loadSchedules();
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error(err.error?.message ?? err.error?.detail ?? 'Error deleting the schedule');
        },
      });
    });
  }
}
