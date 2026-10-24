import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatTableDataSource } from '@angular/material/table';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment } from '../../../core/models/enrollment.model';


@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-enrollments-list.page',
  styleUrl: './enrollments-list.page.scss',
  templateUrl: './enrollments-list.page.html',
})
export class EnrollmentsListPage implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);


  displayedColumns: string[] = ['studentCode', 'studentName', 'majorName', 'academicTermName', 'enrollmentDate', 'totalCredits', 'coursesCount', 'enrollmentStatus', 'actions'];
  dataSource = new MatTableDataSource<Enrollment>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  searchControl = new FormControl('');

  loadEnrollments() {
    this.loading.set(true);
    this.enrollmentService.list({
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value ?? '',
    })
    .subscribe({
      next: (response) => {
        this.dataSource.data = response;
        this.totalItems = response.length;
        this.loading.set(false);
      },
      error: (error) => {
        this.notification.error('error loading enrollments');
        this.loading.set(false);
      }
    });
  }
  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEnrollments();
  }
  editEnrollment(id: number): void {
    this.router.navigate(['/enrollments', id, 'edit']);
  }

  confirmDeleteEnrollment(enrollment: Enrollment): void 
  {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete enrollment',
        message: `Are you sure you want to delete ${enrollment.studentCode}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteEnrollment(enrollment.id);
      }
    });
  }
  deleteEnrollment(id: number): void {
   this.enrollmentService.delete(id).subscribe({
    next: () => {
      this.notification.success('Enrollment deleted successfully');
      this.loadEnrollments();
    },
    error: () => {
      this.notification.error('Error deleting enrollment');
    }
   });
  }

  ngOnInit(): void {
    this.loadEnrollments();
  }






}

