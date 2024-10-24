import type { ContentFeature } from '../pages';
import { cleanable } from '../../utils/cleanup';
import { isSameChapterPageInfo, matchChapterPage } from '../../utils/page-info';
import { appendMovieTimeComponentToAnchors, appendMovieTimeComponentToParent } from './append-movie-time-component';
import { fetchChapterTimeProgress } from './time-progress';

const movieTime: ContentFeature = ({ pageContent$ }) => {
  pageContent$.pipe(
    cleanable(),
  ).subscribe(({ value: { types }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    for (const { name, props } of types) {
      switch (name) {
        case 'COURSE':
          cleanup.add(
            appendMovieTimeComponentToAnchors({
              anchorSelectors: '[aria-label="チャプター一覧"] a:has(h4)',
              parentRelativeSelectors: ':scope > *',
              match: matchChapterPage,
              fetchTimeProgress: fetchChapterTimeProgress,
              isSamePageInfo: isSameChapterPageInfo,
              summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
            }),
          );

          break;

        case 'CHAPTER':
          cleanup.add(
            appendMovieTimeComponentToParent(
              ':has(> [aria-label$="教材リスト"]) > :nth-child(1)',
              fetchChapterTimeProgress(props),
            ),
          );

          break;

        case 'MONTHLY_REPORTS':
          cleanup.add(
            appendMovieTimeComponentToAnchors({
              anchorSelectors: 'a:has([aria-label^="進捗度"])',
              parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(2)',
              match: matchChapterPage,
              fetchTimeProgress: fetchChapterTimeProgress,
              isSamePageInfo: isSameChapterPageInfo,
              summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
            }),
          );

          break;

        // Not recommended due to large number of HTTP requests
        // case 'MY_COURSES':
        //   if (typeof props.tab === 'string') {
        //     cleanup.add(
        //       appendMovieTimeComponentToAnchors({
        //         anchorSelectors: '[aria-label="コース一覧"] a:has(h4)',
        //         parentRelativeSelectors: 'h4',
        //         match: matchCoursePage,
        //         fetchTimeProgress: fetchCourseTimeProgress,
        //         isSamePageInfo: isSameCoursePageInfo,
        //       }),
        //     );
        //   } else {
        //     cleanup.add(
        //       appendMovieTimeComponentToAnchors({
        //         anchorSelectors: 'a[aria-label$="のレポート"]',
        //         parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(1)',
        //         match: matchMonthlyReportsPage,
        //         fetchTimeProgress: fetchMonthlyReportsTimeProgress,
        //         isSamePageInfo: isSameMonthlyReportsPageInfo,
        //       }),
        //     );
        //   }

        //   break;
      }
    }
  });
};

export default movieTime;
