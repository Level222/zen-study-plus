import type { ContentFeature } from '../pages';
import { combineLatest, filter, fromEvent, of, takeUntil, timer } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import { isSameChapterPageInfo, isSameCoursePageInfo, isSameMonthlyReportsPageInfo, matchChapterPage, matchCoursePage, matchMonthlyReportsPage } from '../../utils/page-info';
import { intervalQuerySelector } from '../../utils/rxjs-helpers';
import { appendMovieTimeComponentToAnchorsIfEnabled, appendMovieTimeComponentToAnchorsIfEnabledWithSummaryParentObservable } from './append-movie-time-component';
import styles from './movie-time.module.css';
import { setUpMovieTimeComponentForChapterPage } from './set-up-for-chapter-page';
import { fetchChapterTimeProgress, fetchCourseTimeProgress, fetchMonthlyReportsTimeProgress } from './time-progress';

const movieTime: ContentFeature = ({ pageContent$, syncOptions$ }) => {
  const pageContentAndSyncOptions$ = combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  });

  pageContentAndSyncOptions$.pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const movieTimeOptions = syncOptions.user.movieTime;

    const until$ = timer(movieTimeOptions.timeout);

    for (const { name, pageInfo } of pageContent.types) {
      switch (name) {
        case 'COURSE': {
          cleanup.add(
            appendMovieTimeComponentToAnchorsIfEnabled({
              options: movieTimeOptions.pages.course,
              match: matchChapterPage,
              fetchTimeProgress: fetchChapterTimeProgress,
              isSamePageInfo: isSameChapterPageInfo,
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
              until$,
            }),
          );

          break;
        }

        case 'MY_COURSES': {
          intervalQuerySelector('[role=tabpanel] > :nth-child(2)').pipe(
            filter((parent) => !!parent),
            takeUntil(until$),
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

  setUpMovieTimeComponentForChapterPage(pageContentAndSyncOptions$);
};

export default movieTime;
