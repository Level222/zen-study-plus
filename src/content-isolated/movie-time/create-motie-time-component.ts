import type { TimeProgress, TimeProgressGroup, TimeProgressGroupWithLabel } from './time-progress';
import { autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
import { count, fromEvent, type Observable, share } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
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

const makePopover = (triggerElement: HTMLElement, popoverElement: HTMLElement): Cleanup => {
  const cleanup = Cleanup.empty();

  const animation = new Animation(
    new KeyframeEffect(popoverElement, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 150, fill: 'both' }),
  );

  const update = async () => {
    const { x, y } = await computePosition(triggerElement, popoverElement, {
      middleware: [
        offset(3),
        shift({
          padding: 5,
        }),
      ],
    });

    Object.assign(popoverElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  const cleanupAutoUpdate = Cleanup.empty();
  cleanup.add(cleanupAutoUpdate);

  const pointeroverSubscription = fromEvent(triggerElement, 'pointerover').subscribe(() => {
    if (!popoverElement.isConnected) {
      document.body.append(popoverElement);

      cleanupAutoUpdate.add(new Cleanup(
        autoUpdate(triggerElement, popoverElement, update),
      ));
    }

    animation.playbackRate = 1;
    animation.play();
  });

  cleanup.add(Cleanup.fromAddedNode(popoverElement));
  cleanup.add(Cleanup.fromSubscription(pointeroverSubscription));

  const pointeroutSubscription = fromEvent(triggerElement, 'pointerout').subscribe(() => {
    animation.playbackRate = -1;
    animation.play();
  });

  cleanup.add(Cleanup.fromSubscription(pointeroutSubscription));

  const finishSubscription = fromEvent(animation, 'finish').subscribe(() => {
    if (animation.playbackRate < 0) {
      popoverElement.remove();
      cleanupAutoUpdate.execute();
    }
  });

  cleanup.add(Cleanup.fromSubscription(finishSubscription));

  return cleanup;
};

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

  const timeProgressSubscription = sharedTimeProgress$.pipe(
    cleanable(),
  ).subscribe({
    next: ({ value: { primary, groups }, previousCleanup: previousPopoverCleanup, cleanup: popoverCleanup }) => {
      previousPopoverCleanup.execute();

      cleanup.add(popoverCleanup);

      container.replaceChildren(
        createTimeProgressGroupComponent(primary),
      );

      popoverCleanup.add(makePopover(container, createMovieTimeGroupsComponent(groups)));
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
