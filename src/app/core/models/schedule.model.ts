/** GET /api/schedules. DayOfWeek llega como número (0 = Sunday). Las horas llegan como "HH:mm:ss". */
export interface Schedule {
  id: number;
  sectionId: number;
  dayOfWeek: number | string;
  startTime: string;
  endTime: string;
  classroom: string;
}

export interface ScheduleRow extends Schedule {
  sectionCode: string;
  courseName: string;
}

/** POST /api/schedules */
export interface CreateScheduleRequest {
  sectionId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string;
}

/** PUT /api/schedules/{id}. La sección no se cambia. */
export interface UpdateScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: string;
}
