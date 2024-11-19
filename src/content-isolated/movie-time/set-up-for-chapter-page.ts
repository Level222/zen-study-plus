import type { ChapterPageInfo } from '../../utils/page-info';
import type { SyncOptions } from '../../utils/sync-options';
import type { PageContent } from '../pages';
import type { TimeProgress } from './time-progress';
import { filter, fromEvent, map, type Observable, of, scan, startWith, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
import { intervalQuerySelector } from '../../utils/interval-query-selector';
import { appendMovieTimeComponentToParent } from './append-movie-time-component';
import { fetchChapterTimeProgress } from './time-progress';

type ActionInfoBase = {
  source: 'PAGE_OR_OPTION' | 'EXPANDER_CLICKED';
  syncOptions: SyncOptions;
};

type ActionInfoNonChapterPage = ActionInfoBase & {
  isChapterPage: false;
};

type ActionInfoChapterPage = ActionInfoBase & {
  isChapterPage: true;
  chapterPageInfo: ChapterPageInfo;
};

type ActionInfoChapterPageWithPrevious = ActionInfoChapterPage & {
  previousSyncOptions: SyncOptions | null;
  previousChapterPageInfo: ChapterPageInfo | null;
};

export const setUpMovieTimeComponentForChapterPage = (
  pageContentAndSyncOptions$: Observable<{ pageContent: PageContent; syncOptions: SyncOptions }>,
) => {
  const timeProgress$ = new Subject<TimeProgress>();

  pageContentAndSyncOptions$.pipe(
    switchMap(({ pageContent, syncOptions }): Observable<ActionInfoChapterPage | ActionInfoNonChapterPage> => {
      const chapterPageType = pageContent.types.find((pageType) => pageType.name === 'CHAPTER');

      if (!chapterPageType) {
        return of({
          source: 'PAGE_OR_OPTION',
          isChapterPage: false,
          syncOptions,
        });
      }

      const movieTimeOptions = syncOptions.user.movieTime;

      const actionInfo = {
        isChapterPage: true,
        syncOptions,
        chapterPageInfo: chapterPageType.pageInfo,
      };

      return intervalQuerySelector(movieTimeOptions.pages.chapter.expanderSelectors).pipe(
        takeUntil(timer(movieTimeOptions.timeout)),
        filter((expander) => !!expander),
        switchMap((expander) => fromEvent(expander, 'click')),
        map(() => ({ ...actionInfo, source: 'EXPANDER_CLICKED' } as const)),
        startWith({ ...actionInfo, source: 'PAGE_OR_OPTION' } as const),
      );
    }),
    scan<
      ActionInfoChapterPage | ActionInfoNonChapterPage,
      ActionInfoChapterPageWithPrevious | ActionInfoNonChapterPage,
      Pick<ActionInfoNonChapterPage, 'isChapterPage'> & { syncOptions: null }
    >((previousValue, actionInfo) => {
      if (!actionInfo.isChapterPage) {
        return actionInfo;
      }

      const previousSyncOptions = previousValue.syncOptions;
      const previousChapterPageInfo = previousValue.isChapterPage ? previousValue.chapterPageInfo : null;

      return {
        ...actionInfo,
        previousChapterPageInfo,
        previousSyncOptions,
      };
    }, { isChapterPage: false, syncOptions: null }),
    cleanable(),
  ).subscribe(({ value: actionInfo, previousCleanup, cleanup }) => {
    const { isChapterPage, source, syncOptions } = actionInfo;
    const movieTimeOptions = syncOptions.user.movieTime;

    if (!isChapterPage || !movieTimeOptions.pages.chapter.enabled) {
      previousCleanup.execute();
      return;
    }

    const { previousSyncOptions, chapterPageInfo, previousChapterPageInfo } = actionInfo;

    let needAppendMovieTimeComponent: boolean;

    if (previousSyncOptions === syncOptions) {
      switch (source) {
        case 'PAGE_OR_OPTION':
          needAppendMovieTimeComponent = !previousChapterPageInfo
          || chapterPageInfo.courseId !== previousChapterPageInfo.courseId
          || chapterPageInfo.chapterId !== previousChapterPageInfo.chapterId;
          break;

        case 'EXPANDER_CLICKED':
          needAppendMovieTimeComponent = false;
          break;
      }
    } else {
      needAppendMovieTimeComponent = true;
    }

    if (needAppendMovieTimeComponent) {
      previousCleanup.execute();

      cleanup.add(
        appendMovieTimeComponentToParent(
          intervalQuerySelector(movieTimeOptions.pages.chapter.parentSelectors).pipe(
            takeUntil(timer(movieTimeOptions.timeout)),
          ),
          timeProgress$,
        ),
      );
    } else {
      cleanup.add(previousCleanup);
    }

    const subscription = fetchChapterTimeProgress(chapterPageInfo).subscribe((timeProgress) => {
      timeProgress$.next(timeProgress);
    });

    cleanup.add(Cleanup.fromSubscription(subscription));
  });
};
