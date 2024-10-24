import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import type { PageMatcher } from '../../utils/page-info';
import type { TimeProgress } from './time-progress';
import { concatMap, connectable, forkJoin, map, ReplaySubject, scan, shareReplay, takeUntil, timer } from 'rxjs';
import { Cleanup, modifyProperties } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import { intervalQuerySelector, intervalQuerySelectorAll } from '../../utils/interval-query-selector';
import createMovieTimeComponent from './create-motie-time-component';
import styles from './movie-time.module.css';
import { flatTimeProgress } from './time-progress';

const commonTakeUntil = <T>(): MonoTypeOperatorFunction<T> => takeUntil(timer(5000));

const appendMovieTimeComponentIfMissing = (
  parent: HTMLElement,
  timeProgress$: Observable<TimeProgress>,
): Cleanup => {
  const cleanup = Cleanup.empty();

  const alreadyExist = [...parent.children].some((element) => (
    element.classList.contains(styles.container)
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

  const container = el('div', { className: styles.container }, [
    movieTimeComponent,
  ]);

  const { firstChild } = parent;

  if (firstChild) {
    firstChild.after(container);
  } else {
    parent.append(container);
  }

  cleanup.add(Cleanup.fromAddedNode(container));

  return cleanup;
};

export const appendMovieTimeComponentToParent = (
  parentSelectors: string,
  timeProgress$: Observable<TimeProgress>,
): Cleanup => {
  const cleanup = Cleanup.empty();

  const sharedTimeProgress$ = connectable(timeProgress$, {
    connector: () => new ReplaySubject(),
    resetOnDisconnect: false,
  });

  const timeProgressSubscription = sharedTimeProgress$.connect();
  cleanup.add(Cleanup.fromSubscription(timeProgressSubscription));

  const subscription = intervalQuerySelector(parentSelectors).pipe(
    commonTakeUntil(),
  ).subscribe((parent) => {
    if (parent instanceof HTMLElement) {
      cleanup.add(
        appendMovieTimeComponentIfMissing(parent, sharedTimeProgress$),
      );
    }
  });

  cleanup.add(Cleanup.fromSubscription(subscription));

  return cleanup;
};

type AppendToAnchorsOptions<T extends object> = {
  anchorSelectors: string;
  parentRelativeSelectors: string;
  match: PageMatcher<T>;
  fetchTimeProgress: (pageInfo: T) => Observable<TimeProgress>;
  isSamePageInfo: (a: T, b: T) => boolean;
  summaryParentSelectors?: string;
};

type AppendInfo<T extends object> = {
  pageInfo: T;
  parent: HTMLElement;
  timeProgress$: Observable<TimeProgress>;
};

type AppendInfoAccumulator<T extends object> = {
  accumulated: Omit<AppendInfo<T>, 'parent'>[];
  current: AppendInfo<T>[];
};

export const appendMovieTimeComponentToAnchors = <T extends object>({
  anchorSelectors,
  parentRelativeSelectors,
  match,
  fetchTimeProgress,
  isSamePageInfo,
  summaryParentSelectors,
}: AppendToAnchorsOptions<T>): Cleanup => {
  const cleanup = Cleanup.empty();

  const summaryTimeProgress$ = new ReplaySubject<TimeProgress>(1);

  const appendInfoList$ = intervalQuerySelectorAll<HTMLAnchorElement>(anchorSelectors).pipe(
    scan<
      NodeListOf<HTMLAnchorElement>,
      AppendInfoAccumulator<T>,
      Omit<AppendInfoAccumulator<T>, 'current'>
    >(({ accumulated: prevAccumulated }, anchors) => (
      [...anchors].reduce<AppendInfoAccumulator<T>>(({ accumulated, current }, anchor) => {
        const parent = anchor.querySelector(parentRelativeSelectors);

        if (!(parent instanceof HTMLElement)) {
          return { accumulated, current };
        }

        const matchResult = match(new URL(anchor.href));

        if (!matchResult.match) {
          return { accumulated, current };
        }

        const pageInfo = matchResult.props;

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
        };
      }, { accumulated: prevAccumulated, current: [] })
    ), { accumulated: [] }),
    map(({ current }) => current),
    commonTakeUntil(),
    shareReplay(),
  );

  const anchorsSubscription = appendInfoList$.subscribe((appendInfoList) => {
    for (const { parent, timeProgress$ } of appendInfoList) {
      cleanup.add(
        appendMovieTimeComponentIfMissing(parent, timeProgress$),
      );
    };
  });

  cleanup.add(Cleanup.fromSubscription(anchorsSubscription));

  if (summaryParentSelectors === undefined) {
    return cleanup;
  }

  const summaryTimeProgressSubscription = appendInfoList$.pipe(
    concatMap((appendInfoList) => {
      const timeProgressObservableList = appendInfoList.map(({ timeProgress$ }) => timeProgress$);

      return forkJoin(timeProgressObservableList).pipe(
        map(flatTimeProgress),
      );
    }),
  ).subscribe(summaryTimeProgress$);

  cleanup.add(
    Cleanup.fromSubscription(summaryTimeProgressSubscription),
    appendMovieTimeComponentToParent(
      summaryParentSelectors,
      summaryTimeProgress$,
    ),
  );

  return cleanup;
};
