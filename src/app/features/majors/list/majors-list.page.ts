import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Course } from '../../../core/models/course.model';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PageEvent } from '@angular/material/paginator';
import { MajorService } from '../../../core/services/major.service';
import { Major } from '../../../core/models/major.model';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-majors-list.page',
  styleUrl: './majors-list.page.scss',
  templateUrl: './majors-list.page.html',
})
export class MajorsListPage implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly majorService = inject(MajorService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);


  displayedColumns: string[] = ['Code', 'Name', 'Description', 'actions'];
  dataSource = new MatTableDataSource<Major>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  searchControl = new FormControl('');

  loadMajors() {
    this.loading.set(true);
    this.majorService.list({
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
        this.notification.error('error loading courses');
        this.loading.set(false);
      }
    });
  }
  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMajors();
  }
  editMajor(id: number): void {
    this.router.navigate(['/majors', id, 'edit']);
  }

  confirmDeleteMajor(major: Major): void 
  {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete major',
        message: `Are you sure you want to delete ${major.name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteMajor(major.id);
      }
    });
  }
  deleteMajor(id: number): void {
   this.majorService.delete(id).subscribe({
    next: () => {
      this.notification.success('Major deleted successfully');
      this.loadMajors();
    },
    error: () => {
      this.notification.error('Error deleting major');
    }
   });
  }

  ngOnInit(): void {
    this.loadMajors();
  }




}
