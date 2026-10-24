import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
import { StudentDetail } from '../../../core/models/student.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../../core/services/course.service';
import { CourseDetail } from '../../../core/models/course.model';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-courses-detail.page',
  styleUrl: './courses-detail.page.scss',
  templateUrl: './courses-detail.page.html',
})
export class CoursesDetailPage implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);
      
  loadingData = signal(true);
  course = signal<CourseDetail | null>(null);

  detailTitle(): string {
    const current = this.course();
    return current ? `${current.name}` : 'Course detail';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid course');
      return;
    }

    this.courseService.getById(id).subscribe({
      next: (detail) => {
        this.course.set(detail);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading course');
        this.loadingData.set(false);
      },
    });
  }
}
