import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
import { StudentDetail } from '../../../core/models/student.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-students-detail.page',
  styleUrl: './students-detail.page.scss',
  templateUrl: './students-detail.page.html',
})
export class StudentsDetailPage implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  student = signal<StudentDetail | null>(null);

  detailTitle(): string {
    const current = this.student();
    return current ? `${current.firstName} ${current.lastName}` : 'Student detail';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid student');
      return;
    }

    this.studentService.getById(id).subscribe({
      next: (detail) => {
        this.student.set(detail);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading student');
        this.loadingData.set(false);
      },
    });
  }
}
