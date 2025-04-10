import type { TimeProgress, TimeProgressGroup, TimeProgressGroupWithLabel } from './time-progress';
import { count, type Observable, share } from 'rxjs';
import { Cleanup } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import styles from './movie-time.module.css';

const formatTime = (sourceSec: number): string => {
  const hours = Math.floor(sourceSec / 3600);
  const minutes = Math.floor(sourceSec / 60) % 60;
  const hoursStr = hours ? `${hours}:` : '';
  const minutesStr = `${hours ? String(minutes).padStart(2, '0') : minutes}:`;
  const secondsStr = String(sourceSec % 60).padStart(2, '0');
  return `${hoursStr}${minutesStr}${secondsStr}`;
};

const createTimeProgressGroupComponent = ({ goal, current }: TimeProgressGroup): HTMLElement => {
  if (goal > 0) {
    return el('div', {}, [`${formatTime(current)} / ${formatTime(goal)}`]);
  } else {
    return el('div', { className: styles.faint }, ['- / -']);
  }
};

const createMovieTimeGroupsComponent = (groups: TimeProgressGroupWithLabel[]) => (
  el('dl', { className: styles.groups }, groups.flatMap((group) => (
    [el('dt', {}, [group.label]), el('dd', {}, [createTimeProgressGroupComponent(group)])]
  )))
);

export type CreateResult = {
  movieTimeComponent: HTMLDivElement;
  cleanup: Cleanup;
};

const createMovieTimeComponent = (
  timeProgress$: Observable<TimeProgress>,
): CreateResult => {
  const cleanup = Cleanup.empty();

  const container = el('div', { className: styles.container, title: '' }, [
    el('div', { className: styles.placeholder }),
  ]);

  const sharedTimeProgress$ = timeProgress$.pipe(
    share(),
  );

  const timeProgressSubscription = sharedTimeProgress$.subscribe({
    next: ({ primary, groups }) => {
      container.replaceChildren(
        createTimeProgressGroupComponent(primary),
        createMovieTimeGroupsComponent(groups),
      );
    },
    error: () => {
      container.replaceChildren('Error');
    },
  });

  cleanup.add(Cleanup.fromSubscription(timeProgressSubscription));

  const countSubscription = sharedTimeProgress$.pipe(
    count(),
  ).subscribe((count) => {
    if (count === 0) {
      container.replaceChildren();
    }
  });

  cleanup.add(Cleanup.fromSubscription(countSubscription));

  return {
    movieTimeComponent: container,
    cleanup,
  };
};

export default createMovieTimeComponent;
