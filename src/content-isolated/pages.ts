import type { Observable } from 'rxjs';
import type { Cleanup } from '../utils/cleanup';
import type { DispatchMessageEvent } from '../utils/events';
import type { PageMatcher } from '../utils/page-info';
import type { RuntimeMessage } from '../utils/runtime-messages';
import type { MutationSelector } from '../utils/rxjs-helpers';
import type { SyncOptionsWithFallback } from '../utils/sync-options';
import { matchChapterPage, matchCoursePage, matchMonthlyReportsPage, matchMyCoursesPage, matchReferencePage, matchSectionPage } from '../utils/page-info';

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
    name: 'SECTION',
    match: matchSectionPage,
  },
  {
    name: 'REFERENCE',
    match: matchReferencePage,
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

export type MapToPageType<T extends PageTypeDeclaration[]> = {
  [K in keyof T]: {
    name: T[K]['name'];
    pageInfo: T[K]['match'] extends PageMatcher<infer U> ? U : never;
  }
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
  syncOptions$: Observable<SyncOptionsWithFallback>;
  runtimeMessage$: Observable<RuntimeMessage>;
  dispatchMessageEvent: DispatchMessageEvent;
  mutationSelector: MutationSelector;
};

export type ContentFeature = (init: ContentFeatureInit) => void;
