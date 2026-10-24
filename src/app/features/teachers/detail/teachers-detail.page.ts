import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
import { StudentDetail } from '../../../core/models/student.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MatIconModule } from '@angular/material/icon';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherDetail } from '../../../core/models/teacher.model';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-teachers-detail.page',
  styleUrl: './teachers-detail.page.scss',
  templateUrl: './teachers-detail.page.html',
})
export class TeachersDetailPage implements OnInit {
  private readonly teacherService = inject(TeacherService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  teacher = signal<TeacherDetail | null>(null);

  detailTitle(): string {
    const current = this.teacher();
    return current ? `${current.firstName} ${current.lastName}` : 'Teacher detail';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid teacher');
      return;
    }

    this.teacherService.getById(id).subscribe({
      next: (detail) => {
        this.teacher.set(detail);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading teacher');
        this.loadingData.set(false);
      },
    });
  }
}
