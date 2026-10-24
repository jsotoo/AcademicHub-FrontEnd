import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../../core/models/schedule.model';
import { SectionDetail } from '../../../core/models/section.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { SectionService } from '../../../core/services/section.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { SharedMaterialModule } from '../../../shared/shared-material.module';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  imports: [CommonModule, RouterLink, SharedMaterialModule, PageHeaderComponent, MatIconModule],
  standalone: true,
  selector: 'app-schedules-detail.page',
  styleUrl: './schedules-detail.page.scss',
  templateUrl: './schedules-detail.page.html',
})
export class SchedulesDetailPage implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly sectionService = inject(SectionService);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  loadingData = signal(true);
  schedule = signal<Schedule | null>(null);
  section = signal<SectionDetail | null>(null);

  detailTitle(): string {
    const current = this.schedule();
    if (!current) {
      return 'Schedule';
    }
    return `${this.dayName(current.dayOfWeek)} · ${this.clock(current.startTime)}`;
  }

  dayName(day: number | string): string {
    const index = typeof day === 'number' ? day : DAYS.indexOf(day);
    return DAYS[index] ?? String(day);
  }

  clock(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loadingData.set(false);
      this.notification.error('Invalid schedule');
      return;
    }

    this.scheduleService.getById(id).subscribe({
      next: (schedule) => {
        this.schedule.set(schedule);
        this.sectionService.getById(schedule.sectionId).subscribe({
          next: (section) => {
            this.section.set(section);
            this.loadingData.set(false);
          },
          error: () => this.loadingData.set(false),
        });
      },
      error: () => {
        this.notification.error('Error loading schedule');
        this.loadingData.set(false);
      },
    });
  }
}
