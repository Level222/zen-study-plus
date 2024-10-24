import type { ChapterPageInfo, CoursePageInfo, MonthlyReportsPageInfo } from '../utils/page-info';
import type { Chapter, Course } from './v2-material';
import type { ReportProgressMonthly } from './v2-report-progress-monthly';
import { map, type Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const ORIGIN = 'https://api.nnn.ed.nico';

const callApi = (path: string): Observable<any> => {
  const url = new URL(path, ORIGIN);

  return ajax({
    url: String(url),
    withCredentials: true,
  }).pipe(
    map(({ response }) => response),
  );
};

export const callApiV2MaterialChapter = (
  { courseId, chapterId }: ChapterPageInfo,
): Observable<Chapter> => {
  return callApi(`/v2/material/courses/${courseId}/chapters/${chapterId}`);
};

export const callApiV2MaterialCourse = (
  { courseId }: CoursePageInfo,
): Observable<Course> => {
  return callApi(`/v2/material/courses/${courseId}`);
};

export const callApiV2ReportProgressMonthly = (
  { year, month }: MonthlyReportsPageInfo,
): Observable<ReportProgressMonthly> => {
  return callApi(`/v2/dashboard/report_progresses/monthly/${year}/${month}`);
};
