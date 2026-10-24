import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AcademicTerm } from '../../../core/models/academicterm.model';
import { AcademicTermService } from '../../../core/services/academicterm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-academic-terms-detail.page',
  styleUrl: './academic-terms-detail.page.scss',
  templateUrl: './academic-terms-detail.page.html',
})
export class AcademicTermsDetailPage implements OnInit {
  private readonly termService = inject(AcademicTermService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  term = signal<AcademicTerm | null>(null);

  detailTitle(): string {
    return this.term()?.name || 'Academic term';
  }

  isOpen(status: string): boolean {
    return status === 'Open' || status === 'Active';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid academic term');
      return;
    }

    this.termService.getById(id).subscribe({
      next: (term) => {
        this.term.set(term);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading academic term');
        this.loadingData.set(false);
      },
    });
  }
}
