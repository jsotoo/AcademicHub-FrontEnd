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
import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher } from '../../../core/models/teacher.model';
import { SectionService } from '../../../core/services/section.service';
import { CourseService } from '../../../core/services/course.service';
import { Section } from '../../../core/models/section.model';


@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-sections-list.page',
  styleUrl: './sections-list.page.scss',
  templateUrl: './sections-list.page.html',
})
export class SectionsListPage implements OnInit {

  private readonly auth = inject(AuthService);
  private readonly sectionService = inject(SectionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);


  displayedColumns: string[] = ['Code', 'CourseName', 'TeacherName', 'AcademicTerm', 'MaxCapacity', 'AvailableCapacity', 'actions'];
  dataSource = new MatTableDataSource<Section>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  searchControl = new FormControl('');

  loadSections() {
    this.loading.set(true);
    this.sectionService.list({
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
        this.notification.error('error loading sections');
        this.loading.set(false);
      }
    });
  }
  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSections();
  }
  editSection(id: number): void {
    this.router.navigate(['/sections', id, 'edit']);
  }

  confirmDeleteSection(section: Section): void 
  {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete student',
        message: `Are you sure you want to delete ${section.code}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteSection(section.id);
      }
    });
  }
  deleteSection(id: number): void {
   this.sectionService.delete(id).subscribe({
    next: () => {
      this.notification.success('Section deleted successfully');
      this.loadSections();
    },
    error: () => {
      this.notification.error('Error deleting section');
    }
   });
  }

  ngOnInit(): void {
    this.loadSections();
  }






}

