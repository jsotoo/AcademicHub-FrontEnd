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
import { SectionDetail } from '../../../core/models/section.model';
import { CourseService } from '../../../core/services/course.service';
import { SectionService } from '../../../core/services/section.service';

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-sections-detail.page',
  styleUrl: './sections-detail.page.scss',
  templateUrl: './sections-detail.page.html',
})
export class SectionsDetailPage implements OnInit {
  
  private readonly courseService = inject(CourseService);
  private readonly sectionService = inject(SectionService);
  private readonly teacherService = inject(TeacherService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  section = signal<SectionDetail | null>(null);

  detailTitle(): string {
    const current = this.section();
    return current ? `${current.code}` : 'Section detail';
  }


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid section');
      return;
    }

    this.sectionService.getById(id).subscribe({
      next: (detail) => {
        this.section.set(detail);
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error loading section');
        this.loadingData.set(false);
      },
    });
  }
}
