import type { ContentFeature } from '../pages';
import type { TimeProgress } from './time-progress';
import { combineLatest, filter, fromEvent, map, of, Subject, takeUntil } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import { isSameChapterPageInfo, isSameCoursePageInfo, isSameMonthlyReportsPageInfo, matchChapterPage, matchCoursePage, matchMonthlyReportsPage } from '../../utils/page-info';
import { withPrevious } from '../../utils/rxjs-helpers';
import { appendMovieTimeComponentToAnchorsIfEnabled, appendMovieTimeComponentToAnchorsIfEnabledWithSummaryParentObservable, appendMovieTimeComponentToParent } from './append-movie-time-component';
import styles from './movie-time.module.css';
import { fetchChapterTimeProgress, fetchCourseTimeProgress, fetchMonthlyReportsTimeProgress } from './time-progress';

const movieTime: ContentFeature = ({ pageContent$, syncOptions$, mutationSelector }) => {
  //
  // in the pages other than the chapter page
  //

  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const movieTimeOptions = syncOptions.user.movieTime;

    const until$ = cleanup.executed$;

    for (const { name, pageInfo } of pageContent.types) {
      switch (name) {
        case 'COURSE': {
          cleanup.add(
            appendMovieTimeComponentToAnchorsIfEnabled({
              options: movieTimeOptions.pages.course,
              match: matchChapterPage,
              fetchTimeProgress: fetchChapterTimeProgress,
              isSamePageInfo: isSameChapterPageInfo,
              mutationSelector,
              until$,
            }),
          );

          break;
        }

        case 'MONTHLY_REPORTS': {
          cleanup.add(
            appendMovieTimeComponentToAnchorsIfEnabled({
              options: movieTimeOptions.pages.monthlyReports,
              match: matchChapterPage,
              fetchTimeProgress: fetchChapterTimeProgress,
              isSamePageInfo: isSameChapterPageInfo,
              mutationSelector,
              until$,
            }),
          );

          break;
        }

        case 'MY_COURSES': {
          mutationSelector.selector('[role=tabpanel] > :nth-child(2)').pipe(
            filter((parent) => !!parent),
            takeUntil(cleanup.executed$),
          ).subscribe((sectionsWrapper) => {
            const alreadyExist = [...sectionsWrapper.children].some((element) => (
              element.classList.contains(styles.section)
            ));

            if (alreadyExist) {
              return;
            }

            const button = el('button', { type: 'button', className: styles.button }, ['リスト中すべての動画時間を取得する']);

            const section = el('div', { className: styles.section }, [
              el('h3', { className: styles.heading }, ['動画時間']),
              el('div', {}, [
                button,
                el('div', { className: styles.warning }, ['大量の通信が必要なため、繰り返しの実行は推奨されません']),
              ]),
            ]);

            sectionsWrapper.prepend(section);
            cleanup.add(Cleanup.fromAddedNode(section));

            fromEvent(button, 'click').pipe(
              takeUntil(cleanup.executed$),
            ).subscribe(() => {
              button.disabled = true;

              if (typeof pageInfo.tab === 'string' && pageInfo.tab !== 'n_school_report') {
                cleanup.add(
                  appendMovieTimeComponentToAnchorsIfEnabled({
                    options: movieTimeOptions.pages.myCourse,
                    match: matchCoursePage,
                    fetchTimeProgress: fetchCourseTimeProgress,
                    isSamePageInfo: isSameCoursePageInfo,
                    mutationSelector,
                    until$,
                  }),
                );
              } else {
                const summaryParent = el('div', {}, ['年間レポート']);
                section.append(summaryParent);

                cleanup.add(
                  appendMovieTimeComponentToAnchorsIfEnabledWithSummaryParentObservable({
                    options: movieTimeOptions.pages.myCourseReport,
                    summaryParent$: of(summaryParent),
                    match: matchMonthlyReportsPage,
                    fetchTimeProgress: fetchMonthlyReportsTimeProgress,
                    isSamePageInfo: isSameMonthlyReportsPageInfo,
                    mutationSelector,
                    until$,
                  }),
                );
              }
            });
          });

          break;
        }
      }
    }
  });

  //
  // in the chapter page
  //

  const chapterPageTimeProgress$ = new Subject<TimeProgress>();

  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    withPrevious(undefined),
    // multiple cleanups
    cleanable(),
    cleanable(),
    map(({
      value: { value, previousCleanup: previousChapterCleanup, cleanup: chapterCleanup },
      previousCleanup: previousResourceCleanup,
      cleanup: resourceCleanup,
    }) => ({ value, previousChapterCleanup, chapterCleanup, previousResourceCleanup, resourceCleanup })),
  ).subscribe(({ value: [previous, current], previousChapterCleanup, chapterCleanup, previousResourceCleanup, resourceCleanup }) => {
    const movieTimeOptions = current.syncOptions.user.movieTime;

    if (!movieTimeOptions.pages.chapter.enabled) {
      previousChapterCleanup.execute();
      previousResourceCleanup.execute();
      return;
    }

    const currentChapterPageType = current.pageContent.types.find((pageType) => pageType.name === 'CHAPTER');

    if (!currentChapterPageType) {
      previousChapterCleanup.execute();
      previousResourceCleanup.execute();
      return;
    }

    let updateMovieTimeComponent: boolean;
    let updateTimeProgress: boolean;

    // the sync options changed
    if (!previous || previous.syncOptions !== current.syncOptions) {
      updateMovieTimeComponent = true;
      updateTimeProgress = true;
    } else {
      const previousChapterPageType = previous.pageContent.types.find((pageType) => pageType.name === 'CHAPTER');

      // the previous page is not a chapter page
      if (!previousChapterPageType) {
        updateMovieTimeComponent = true;
        updateTimeProgress = true;
      } else {
        // the previous chapter and current chapter are same
        if (isSameChapterPageInfo(previousChapterPageType.pageInfo, currentChapterPageType.pageInfo)) {
          updateMovieTimeComponent = false;
          updateTimeProgress = false;
        } else {
          updateMovieTimeComponent = false;
          updateTimeProgress = true;
        }
      }
    }

    if (updateMovieTimeComponent) {
      previousChapterCleanup.execute();

      chapterCleanup.add(
        appendMovieTimeComponentToParent(
          mutationSelector.selector(movieTimeOptions.pages.chapter.parentSelectors).pipe(
            takeUntil(chapterCleanup.executed$),
          ),
          chapterPageTimeProgress$,
        ),
      );
    } else {
      chapterCleanup.add(previousChapterCleanup);
    }

    if (updateTimeProgress) {
      previousResourceCleanup.execute();

      fetchChapterTimeProgress(currentChapterPageType.pageInfo).pipe(
        takeUntil(resourceCleanup.executed$),
      ).subscribe((timeProgress) => {
        chapterPageTimeProgress$.next(timeProgress);
      });
    } else {
      resourceCleanup.add(previousResourceCleanup);
    }
  });
};

export default movieTime;
