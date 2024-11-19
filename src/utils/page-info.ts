import { isPositiveInteger } from './helpers';

export type PageMatcherResult<T extends object> =
  | {
    match: true;
    pageInfo: T;
  }
  | {
    match: false;
  };

export type PageMatcher<T extends object = object> = (url: URL) => PageMatcherResult<T>;

export type CoursePageInfo = {
  courseId: number;
};

export const matchCoursePage: PageMatcher<CoursePageInfo> = (url) => {
  const matchResult = url.pathname.match(/^\/courses\/(\d+)\/?$/);

  if (!matchResult) {
    return { match: false };
  }

  const [, courseIdStr] = matchResult;

  const courseId = Number(courseIdStr);

  if (!isPositiveInteger(courseId)) {
    return { match: false };
  }

  return {
    match: true,
    pageInfo: { courseId },
  };
};

export const isSameCoursePageInfo = (a: CoursePageInfo, b: CoursePageInfo) => (
  a.courseId === b.courseId
);

export type ChapterPageInfo = {
  courseId: number;
  chapterId: number;
  resource?: {
    resourceType: string;
    resourceId: number;
  };
};

export const matchChapterPage: PageMatcher<ChapterPageInfo> = (url) => {
  const matchResult = url.pathname.match(/^\/courses\/(\d+)\/chapters\/(\d+)(?:\/([^/]+)\/(\d+))?\/?$/);

  if (!matchResult) {
    return { match: false };
  }

  const [, courseIdStr, chapterIdStr, resourceType, resourceIdStr] = matchResult;

  const courseId = Number(courseIdStr);
  const chapterId = Number(chapterIdStr);

  if (!isPositiveInteger(courseId) || !isPositiveInteger(chapterId)) {
    return { match: false };
  }

  if (!resourceType || !resourceIdStr) {
    return {
      match: true,
      pageInfo: { courseId, chapterId },
    };
  }

  // Lesson page is not similar to other chapter pages
  if (resourceType === 'lessons') {
    return { match: false };
  }

  const resourceId = Number(resourceIdStr);

  if (!isPositiveInteger(resourceId)) {
    return { match: false };
  }

  return {
    match: true,
    pageInfo: { courseId, chapterId, resource: { resourceType, resourceId } },
  };
};

export const isSameChapterPageInfo = (a: ChapterPageInfo, b: ChapterPageInfo): boolean => {
  if (!!a.resource !== !!b.resource) {
    return false;
  }

  if (a.resource && b.resource && (a.resource.resourceId !== b.resource.resourceId || a.resource.resourceType !== b.resource.resourceType)) {
    return false;
  }

  return a.courseId === b.courseId && a.chapterId === b.chapterId;
};

export type MonthlyReportsPageInfo = {
  year: number;
  month: number;
};

export const matchMonthlyReportsPage: PageMatcher<MonthlyReportsPageInfo> = (url) => {
  const matchResult = url.pathname.match(/^\/study_plans\/month\/(\d+)\/(\d+)\/?$/);

  if (!matchResult) {
    return { match: false };
  }

  const [, yearStr, monthStr] = matchResult;

  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!isPositiveInteger(year) || !isPositiveInteger(month)) {
    return { match: false };
  }

  return {
    match: true,
    pageInfo: { year, month },
  };
};

export const isSameMonthlyReportsPageInfo = (a: MonthlyReportsPageInfo, b: MonthlyReportsPageInfo) => (
  a.year === b.year && a.month === b.month
);

export type MyCoursesPageInfo = {
  tab: string | null;
};

export const matchMyCoursesPage: PageMatcher<MyCoursesPageInfo> = (url) => {
  if (!/^\/my_course\/?$/.test(url.pathname)) {
    return { match: false };
  };

  return {
    match: true,
    pageInfo: {
      tab: url.searchParams.get('tab'),
    },
  };
};
