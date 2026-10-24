import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EnrollmentDetailService } from '../../../core/services/enrollment-detail.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SectionService } from '../../../core/services/section.service';
import { EnrollmentCourseRow } from '../../../core/models/enrollment-detail.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-enrollment-details-list.page',
  styleUrl: './enrollment-details-list.page.scss',
  templateUrl: './enrollment-details-list.page.html',
})
export class EnrollmentDetailsListPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly detailService = inject(EnrollmentDetailService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly sectionService = inject(SectionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'studentCode',
    'studentName',
    'sectionCode',
    'courseName',
    'registeredAt',
    'detailStatus',
    'actions',
  ];
  dataSource = new MatTableDataSource<EnrollmentCourseRow>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.loading.set(true);
    forkJoin({
      details: this.detailService.list({
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize,
        search: '',
      }),
      enrollments: this.enrollmentService.list({ pageNumber: 1, pageSize: 200, search: '' }),
      sections: this.sectionService.list({ pageNumber: 1, pageSize: 200, search: '' }),
    }).subscribe({
      next: ({ details, enrollments, sections }) => {
        const enrollmentById = new Map(enrollments.map((item) => [item.id, item]));
        const sectionById = new Map(sections.map((item) => [item.id, item]));
        this.dataSource.data = details.map((detail) => {
          const enrollment = enrollmentById.get(detail.enrollmentId);
          const section = sectionById.get(detail.sectionId);
          return {
            ...detail,
            studentCode: enrollment?.studentCode ?? '',
            studentName: enrollment?.studentName ?? '',
            majorName: enrollment?.majorName ?? '',
            academicTermName: enrollment?.academicTermName ?? section?.academicTermName ?? '',
            sectionCode: section?.code ?? '',
            courseName: section?.courseName ?? '',
            teacherName: section?.teacherName ?? '',
          };
        });
        this.totalItems = details.length;
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error loading enrollment details');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDetails();
  }

  editDetail(id: number): void {
    this.router.navigate(['/enrollment-details', id, 'edit']);
  }

  confirmDrop(row: EnrollmentCourseRow): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Drop course',
        message: `Drop ${row.courseName || 'this course'} for ${row.studentName || 'this student'}?`,
        confirmLabel: 'Drop',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.detailService.drop(row.id).subscribe({
          next: () => {
            this.notification.success('Course dropped');
            this.loadDetails();
          },
          error: (err: HttpErrorResponse) => this.notification.error(this.errorMessage(err, 'Error dropping the course')),
        });
      }
    });
  }

  confirmDelete(row: EnrollmentCourseRow): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete enrollment detail',
        message: `Delete the ${row.detailStatus} course for ${row.studentName || 'this student'}? A registered course must be dropped first.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.detailService.delete(row.id).subscribe({
          next: () => {
            this.notification.success('Enrollment detail deleted');
            this.loadDetails();
          },
          error: (err: HttpErrorResponse) => this.notification.error(this.errorMessage(err, 'Error deleting the enrollment detail')),
        });
      }
    });
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    return err.error?.message ?? err.error?.detail ?? fallback;
  }
}
