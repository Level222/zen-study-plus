import type { ContentFeature } from '../pages';
import { combineLatest, timer } from 'rxjs';
import { cleanable } from '../../utils/cleanup';
import { isSameChapterPageInfo, isSameCoursePageInfo, isSameMonthlyReportsPageInfo, matchChapterPage, matchCoursePage, matchMonthlyReportsPage } from '../../utils/page-info';
import { appendMovieTimeComponentToAnchorsIfEnabled } from './append-movie-time-component';
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
        case 'COURSE':
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

        case 'MONTHLY_REPORTS':
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

        case 'MY_COURSES':
          if (typeof pageInfo.tab === 'string') {
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
            cleanup.add(
              appendMovieTimeComponentToAnchorsIfEnabled({
                options: movieTimeOptions.pages.myCourseReport,
                match: matchMonthlyReportsPage,
                fetchTimeProgress: fetchMonthlyReportsTimeProgress,
                isSamePageInfo: isSameMonthlyReportsPageInfo,
                until$,
              }),
            );
          }

          break;
      }
    }
  });

  setUpMovieTimeComponentForChapterPage(pageContentAndSyncOptions$);
};

export default movieTime;
