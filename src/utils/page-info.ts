import { parseToPositiveIntegers } from './helpers';

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

  try {
    const [courseId] = parseToPositiveIntegers([courseIdStr]);

    return {
      match: true,
      pageInfo: { courseId },
    };
  } catch {
    return { match: false };
  }
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

  try {
    const [courseId, chapterId] = parseToPositiveIntegers([courseIdStr, chapterIdStr]);

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

    const [resourceId] = parseToPositiveIntegers([resourceIdStr]);

    return {
      match: true,
      pageInfo: { courseId, chapterId, resource: { resourceType, resourceId } },
    };
  } catch {
    return { match: false };
  }
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

export type SectionPageInfoChapterResource = {
  type: 'CHAPTER_RESOURCE';
  courseId: number;
  chapterId: number;
  resourceType: string;
  resourceId: number;
  isResult: boolean;
};

export type SectionPageInfoLink = {
  type: 'LINK';
  linkId: number;
};

export type SectionPageInfo = SectionPageInfoChapterResource | SectionPageInfoLink;

export const matchSectionPage: PageMatcher<SectionPageInfo> = (url) => {
  const chapterResourceMatchResult = url.pathname.match(/^\/contents\/courses\/(\d+)\/chapters\/(\d+)\/([^/]+)\/(\d+)(?:\/([^/]+))?\/?$/);

  if (!chapterResourceMatchResult) {
    const linkMatchResult = url.pathname.match(/^\/contents\/links\/(\d+)\/?$/);

    if (!linkMatchResult) {
      return { match: false };
    }

    const [, linkIdStr] = linkMatchResult;

    try {
      const [linkId] = parseToPositiveIntegers([linkIdStr]);

      return {
        match: true,
        pageInfo: {
          type: 'LINK',
          linkId,
        },
      };
    } catch {
      return { match: false };
    }
  }

  const [, courseIdStr, chapterIdStr, resourceType, resourceIdStr, type] = chapterResourceMatchResult;

  try {
    const [courseId, chapterId, resourceId] = parseToPositiveIntegers([courseIdStr, chapterIdStr, resourceIdStr]);

    return {
      match: true,
      pageInfo: {
        type: 'CHAPTER_RESOURCE',
        courseId,
        chapterId,
        resourceType,
        resourceId,
        isResult: type === 'result',
      },
    };
  } catch {
    return { match: false };
  }
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

  try {
    const [year, month] = parseToPositiveIntegers([yearStr, monthStr]);

    return {
      match: true,
      pageInfo: { year, month },
    };
  } catch {
    return { match: false };
  }
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
  }

  return {
    match: true,
    pageInfo: {
      tab: url.searchParams.get('tab'),
    },
  };
};
