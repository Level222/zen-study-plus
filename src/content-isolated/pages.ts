import type { Observable } from 'rxjs';
import type { Cleanup } from '../utils/cleanup';
import type { PageMatcher } from '../utils/page-info';
import { matchChapterPage, matchCoursePage, matchMonthlyReportsPage, matchMyCoursesPage } from '../utils/page-info';

export type PageTypeDeclaration = {
  name: string;
  match: PageMatcher;
};

export const knownPageTypes = [
  {
    name: 'COURSE',
    match: matchCoursePage,
  },
  {
    name: 'CHAPTER',
    match: matchChapterPage,
  },
  {
    name: 'MONTHLY_REPORTS',
    match: matchMonthlyReportsPage,
  },
  {
    name: 'MY_COURSES',
    match: matchMyCoursesPage,
  },
] as const satisfies PageTypeDeclaration[];

export type ToPageType<T extends PageTypeDeclaration> = {
  name: T['name'];
  props: T['match'] extends PageMatcher<infer U> ? U : never;
};

export type MapToPageType<T extends PageTypeDeclaration[]> = {
  [K in keyof T]: ToPageType<T[K]>
};

export type PageType = MapToPageType<typeof knownPageTypes>[number];

export type PageContent = {
  url: URL;
  types: PageType[];
};

export type PageLoad = (pageContents: PageContent) => Cleanup;

export type ContentFeatureInit = {
  /**
   * subscribeした時とページが遷移した時に発火
   */
  pageContent$: Observable<PageContent>;
};

export type ContentFeature = (init: ContentFeatureInit) => void;
