import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatTableDataSource } from '@angular/material/table';
import { Student } from '../../../core/models/student.model';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';


@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-students-list.page',
  styleUrl: './students-list.page.scss',
  templateUrl: './students-list.page.html',
})
export class StudentsListPage implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);


  displayedColumns: string[] = ['Code', 'Full Name', 'Email', 'Major', 'Phone Number', 'Academic Status', 'actions'];
  dataSource = new MatTableDataSource<Student>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  searchControl = new FormControl('');

  loadStudents() {
    this.loading.set(true);
    this.studentService.list({
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
        this.notification.error('error loading students');
        this.loading.set(false);
      }
    });
  }
  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStudents();
  }
  editStudent(id: number): void {
    this.router.navigate(['/students', id, 'edit']);
  }

  confirmDeleteStudent(student: Student): void 
  {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete student',
        message: `Are you sure you want to delete ${student.fullName}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteStudent(student.id);
      }
    });
  }
  deleteStudent(id: number): void {
   this.studentService.delete(id).subscribe({
    next: () => {
      this.notification.success('Student deleted successfully');
      this.loadStudents();
    },
    error: () => {
      this.notification.error('Error deleting student');
    }
   });
  }

  ngOnInit(): void {
    this.loadStudents();
  }






}

