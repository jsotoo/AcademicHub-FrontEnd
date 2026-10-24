import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AcademicTermService } from '../../../core/services/academicterm.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AcademicTerm } from '../../../core/models/academicterm.model';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, EmptyState],
  standalone: true,
  selector: 'app-academic-terms-list.page',
  styleUrl: './academic-terms-list.page.scss',
  templateUrl: './academic-terms-list.page.html',
})
export class AcademicTermsListPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly termService = inject(AcademicTermService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'startDate', 'endDate', 'termStatus', 'actions'];
  dataSource = new MatTableDataSource<AcademicTerm>([]);
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  readonly isAdmin = computed(() => this.auth.isAdmin());

  ngOnInit(): void {
    this.loadTerms();
  }

  loadTerms(): void {
    this.loading.set(true);
    this.termService.list({
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      search: '',
    }).subscribe({
      next: (terms) => {
        this.dataSource.data = terms;
        this.totalItems = terms.length;
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error loading academic terms');
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTerms();
  }

  isOpen(status: string): boolean {
    return status === 'Open' || status === 'Active';
  }

  editTerm(id: number): void {
    this.router.navigate(['/academic-terms', id, 'edit']);
  }

  openTerm(term: AcademicTerm): void {
    this.termService.open(term.id).subscribe({
      next: () => {
        this.notification.success('Academic term opened');
        this.loadTerms();
      },
      error: (err: HttpErrorResponse) => this.notification.error(this.errorMessage(err, 'Error opening the term')),
    });
  }

  closeTerm(term: AcademicTerm): void {
    this.termService.close(term.id).subscribe({
      next: () => {
        this.notification.success('Academic term closed');
        this.loadTerms();
      },
      error: (err: HttpErrorResponse) => this.notification.error(this.errorMessage(err, 'Error closing the term')),
    });
  }

  confirmDelete(term: AcademicTerm): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      autoFocus: false,
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete academic term',
        message: `Delete ${term.name}? An open term cannot be deleted.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.termService.delete(term.id).subscribe({
        next: () => {
          this.notification.success('Academic term deleted');
          this.loadTerms();
        },
        error: (err: HttpErrorResponse) => this.notification.error(this.errorMessage(err, 'Error deleting the term')),
      });
    });
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    return err.error?.message ?? err.error?.detail ?? fallback;
  }
}
