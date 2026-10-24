import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MajorService } from '../../../core/services/major.service';
import { MajorDetail } from '../../../core/models/major.model';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent],
  standalone: true,
  selector: 'app-majors-detail.page',
  styleUrl: './majors-detail.page.scss',
  templateUrl: './majors-detail.page.html',
})
export class MajorsDetailPage implements OnInit {
  private readonly majorService = inject(MajorService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);
      
  loadingData = signal(true);
  major = signal<MajorDetail | null>(null);

  detailTitle(): string {
    const current = this.major();
    return current ? `${current.name}` : 'Major detail';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid major');
      return;
    }

    this.majorService.getById(id).subscribe({
      next: (detail) => {
        this.major.set(detail);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading major');
        this.loadingData.set(false);
      },
    });
  }
}
