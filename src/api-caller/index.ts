import type { Observable } from 'rxjs';
import type { ChapterPageInfo, CoursePageInfo, MonthlyReportsPageInfo } from '../utils/page-info';
import type { User } from './v1-users';
import type { Chapter, Course } from './v2-material';
import type { ReportProgressMonthly } from './v2-report-progress-monthly';
import { map, shareReplay } from 'rxjs';
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

export const user$ = callApi('/v1/users').pipe(
  shareReplay({
    bufferSize: 1,
    refCount: false,
  }),
);

export const callApiV2MaterialChapter = (
  { courseId, chapterId }: ChapterPageInfo,
): Observable<Chapter> => {
  return callApi(`/v2/material/courses/${courseId}/chapters/${chapterId}?revision=1`);
};

export const callApiV2MaterialCourse = (
  { courseId }: CoursePageInfo,
): Observable<Course> => {
  return callApi(`/v2/material/courses/${courseId}?revision=1`);
};

export const callApiV2ReportProgressMonthly = (
  { year, month }: MonthlyReportsPageInfo,
): Observable<ReportProgressMonthly> => {
  return callApi(`/v2/dashboard/report_progresses/monthly/${year}/${month}`);
};

export const callApiV2ZenUnivReportProgressMonthly = (
  { year, month }: MonthlyReportsPageInfo,
): Observable<ReportProgressMonthly> => {
  return callApi(`/v2/dashboard/report_progresses/monthly/${year}/${month}?service=zen_univ`);
};

export const callApiV1Users = (): Observable<User> => {
  return callApi('/v1/users');
};
