import type { Observable } from 'rxjs';
import type { SetOptional } from 'type-fest';
import type { PageMatcher } from '../../utils/page-info';
import type { MovieTimeListPageOptionsRequired, MovieTimeListPageOptionsWithSummaryRequired } from '../../utils/sync-options';
import type { TimeProgress } from './time-progress';
import { concatMap, connectable, filter, forkJoin, map, ReplaySubject, scan, shareReplay, takeUntil } from 'rxjs';
import { Cleanup, modifyProperties } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import { intervalQuerySelector, intervalQuerySelectorAll } from '../../utils/rxjs-helpers';
import createMovieTimeComponent from './create-motie-time-component';
import styles from './movie-time.module.css';
import { flatTimeProgress } from './time-progress';

const appendMovieTimeComponentIfMissing = (
  parent: HTMLElement,
  timeProgress$: Observable<TimeProgress>,
): Cleanup => {
  const cleanup = Cleanup.empty();

  const alreadyExist = [...parent.children].some((element) => (
    element.classList.contains(styles.wrapper)
  ));

  if (alreadyExist) {
    return cleanup;
  }

  cleanup.add(
    modifyProperties(parent.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }),
  );

  const {
    movieTimeComponent,
    cleanup: cleanupMovieTimeComponent,
  } = createMovieTimeComponent(timeProgress$);
  cleanup.add(cleanupMovieTimeComponent);

  const wrapper = el('div', { className: styles.wrapper }, [
    movieTimeComponent,
  ]);

  const { firstChild } = parent;

  if (firstChild) {
    firstChild.after(wrapper);
  } else {
    parent.append(wrapper);
  }

  cleanup.add(Cleanup.fromAddedNode(wrapper));

  return cleanup;
};

export const appendMovieTimeComponentToParent = (
  parent$: Observable<Element | null>,
  timeProgress$: Observable<TimeProgress>,
): Cleanup => {
  const cleanup = Cleanup.empty();

  const sharedTimeProgress$ = connectable(timeProgress$, {
    connector: () => new ReplaySubject(),
    resetOnDisconnect: false,
  });

  const timeProgressSubscription = sharedTimeProgress$.connect();
  cleanup.add(Cleanup.fromSubscription(timeProgressSubscription));

  parent$.pipe(
    takeUntil(cleanup.executed$),
  ).subscribe((parent) => {
    if (parent instanceof HTMLElement) {
      cleanup.add(
        appendMovieTimeComponentIfMissing(parent, sharedTimeProgress$),
      );
    }
  });

  return cleanup;
};

type MovieTimeListPageOptionsWithOptionalSummary = SetOptional<
  MovieTimeListPageOptionsWithSummaryRequired,
  'summaryParentSelectors'
>;

export type AppendToAnchorsOptions<T extends object> =
  & Pick<MovieTimeListPageOptionsWithOptionalSummary, 'parentRelativeSelectors'>
  & {
    anchors$: Observable<Iterable<HTMLAnchorElement>>;
    summaryParent$?: Observable<Element | null>;
    match: PageMatcher<T>;
    fetchTimeProgress: (pageInfo: T) => Observable<TimeProgress>;
    isSamePageInfo: (a: T, b: T) => boolean;
  };

type AppendInfo<T extends object> = {
  pageInfo: T;
  parent: HTMLElement;
  timeProgress$: Observable<TimeProgress>;
};

type AppendInfoAccumulator<T extends object> = {
  accumulated: Omit<AppendInfo<T>, 'parent'>[];
  current: AppendInfo<T>[];
  hasNoChanges: boolean;
};

export const appendMovieTimeComponentToAnchors = <T extends object>({
  anchors$,
  summaryParent$,
  parentRelativeSelectors,
  match,
  fetchTimeProgress,
  isSamePageInfo,
}: AppendToAnchorsOptions<T>): Cleanup => {
  const cleanup = Cleanup.empty();

  const appendInfoList$ = anchors$.pipe(
    scan<
      Iterable<HTMLAnchorElement>,
      AppendInfoAccumulator<T>,
      Pick<AppendInfoAccumulator<T>, 'accumulated'>
    >(({ accumulated: prevAccumulated }, anchors) => (
      [...anchors].reduce<AppendInfoAccumulator<T>>(({ accumulated, current, hasNoChanges }, anchor) => {
        const parent = anchor.querySelector(parentRelativeSelectors);

        if (!(parent instanceof HTMLElement)) {
          return { accumulated, current, hasNoChanges };
        }

        const matchResult = match(new URL(anchor.href));

        if (!matchResult.match) {
          return { accumulated, current, hasNoChanges };
        }

        const { pageInfo } = matchResult;

        const alreadyAccumulatedAppendInfo = prevAccumulated.find((accumulatedAppendInfo) => (
          isSamePageInfo(accumulatedAppendInfo.pageInfo, pageInfo)
        ));

        if (alreadyAccumulatedAppendInfo) {
          return {
            accumulated,
            current: [
              ...current,
              {
                pageInfo,
                parent,
                timeProgress$: alreadyAccumulatedAppendInfo.timeProgress$,
              },
            ],
            hasNoChanges,
          };
        }

        const timeProgress$ = fetchTimeProgress(pageInfo).pipe(
          shareReplay(),
        );

        return {
          accumulated: [
            ...accumulated,
            { pageInfo, timeProgress$ },
          ],
          current: [
            ...current,
            { pageInfo, parent, timeProgress$ },
          ],
          hasNoChanges: false,
        };
      }, { accumulated: prevAccumulated, current: [], hasNoChanges: true })
    ), { accumulated: [] }),
    map(({ current, hasNoChanges }) => ({ appendInfoList: current, hasNoChanges })),
    shareReplay(),
  );

  appendInfoList$.pipe(
    takeUntil(cleanup.executed$),
  ).subscribe(({ appendInfoList }) => {
    for (const { parent, timeProgress$ } of appendInfoList) {
      cleanup.add(
        appendMovieTimeComponentIfMissing(parent, timeProgress$),
      );
    }
  });

  if (summaryParent$ === undefined) {
    return cleanup;
  }

  const summaryTimeProgress$ = new ReplaySubject<TimeProgress>(1);

  appendInfoList$.pipe(
    filter(({ hasNoChanges }) => !hasNoChanges),
    concatMap(({ appendInfoList }) => {
      const timeProgressObservableList = appendInfoList.map(({ timeProgress$ }) => timeProgress$);

      return forkJoin(timeProgressObservableList).pipe(
        map(flatTimeProgress),
      );
    }),
  ).pipe(
    takeUntil(cleanup.executed$),
  ).subscribe(summaryTimeProgress$);

  cleanup.add(
    appendMovieTimeComponentToParent(summaryParent$, summaryTimeProgress$),
  );

  return cleanup;
};

export type AppendToAnchorsIfEnabledWithSummaryParentObservableOptions<T extends object> =
  & Pick<AppendToAnchorsOptions<T>, 'summaryParent$' | 'match' | 'fetchTimeProgress' | 'isSamePageInfo'>
  & {
    options: MovieTimeListPageOptionsRequired;
    until$: Observable<unknown>;
  };

export const appendMovieTimeComponentToAnchorsIfEnabledWithSummaryParentObservable = <T extends object>({
  options: { enabled, parentRelativeSelectors, anchorSelectors },
  match,
  fetchTimeProgress,
  isSamePageInfo,
  summaryParent$,
  until$,
}: AppendToAnchorsIfEnabledWithSummaryParentObservableOptions<T>): Cleanup => {
  if (enabled) {
    return appendMovieTimeComponentToAnchors({
      anchors$: intervalQuerySelectorAll<HTMLAnchorElement>(anchorSelectors).pipe(
        takeUntil(until$),
      ),
      summaryParent$,
      parentRelativeSelectors,
      match,
      fetchTimeProgress,
      isSamePageInfo,
    });
  }

  return Cleanup.empty();
};

export type AppendToAnchorsIfEnabledOptions<T extends object> =
  & Pick<AppendToAnchorsOptions<T>, 'match' | 'fetchTimeProgress' | 'isSamePageInfo'>
  & {
    options: MovieTimeListPageOptionsWithOptionalSummary;
    until$: Observable<unknown>;
  };

export const appendMovieTimeComponentToAnchorsIfEnabled = <T extends object>({
  options: { summaryParentSelectors, ...restOptions },
  match,
  fetchTimeProgress,
  isSamePageInfo,
  until$,
}: AppendToAnchorsIfEnabledOptions<T>): Cleanup => {
  return appendMovieTimeComponentToAnchorsIfEnabledWithSummaryParentObservable({
    options: restOptions,
    match,
    fetchTimeProgress,
    isSamePageInfo,
    until$,
    ...typeof summaryParentSelectors === 'string'
      ? {
          summaryParent$: intervalQuerySelector(summaryParentSelectors).pipe(
            takeUntil(until$),
          ),
        }
      : {},
  });
};
