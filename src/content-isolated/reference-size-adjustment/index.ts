import type { RuntimeMessage } from '../../utils/runtime-messages';
import type { ContentFeature } from '../pages';
import { combineLatest, distinctUntilChanged, filter, map, startWith, takeUntil, takeWhile, timer } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
import { fromResizeObserver, intervalQuerySelector } from '../../utils/rxjs-helpers';

const referenceSizeAdjustment: ContentFeature = ({ pageContent$, syncOptions$, runtimeMessage$ }) => {
  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const referenceSizeAdjustmentOptions = syncOptions.user.referenceSizeAdjustment;

    if (!referenceSizeAdjustmentOptions.enabled) {
      return;
    }

    for (const { name, pageInfo } of pageContent.types) {
      switch (name) {
        case 'REFERENCE': {
          fromResizeObserver(document.documentElement).pipe(
            startWith(undefined),
          ).pipe(
            map(() => Math.ceil(document.documentElement.getBoundingClientRect().height)),
            // 無限ループを回避
            takeWhile((height) => height < referenceSizeAdjustmentOptions.maxHeight, true),
            takeUntil(cleanup.executed$),
          ).subscribe((height) => {
            chrome.runtime.sendMessage<RuntimeMessage>({
              type: 'SEND_BACK_RESIZE_REFERENCE',
              sendBackHeight: Math.min(height, referenceSizeAdjustmentOptions.maxHeight),
            });
          });

          break;
        }

        case 'SECTION': {
          if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
            return;
          }

          intervalQuerySelector<HTMLIFrameElement>(
            referenceSizeAdjustmentOptions.referenceSelectors,
          ).pipe(
            distinctUntilChanged(),
            filter((reference) => !!reference),
            takeUntil(timer(referenceSizeAdjustmentOptions.timeout)),
            takeUntil(cleanup.executed$),
            cleanable(),
          ).subscribe(({ value: reference, cleanup: cleanupReference, previousCleanup: previousCleanupReference }) => {
            previousCleanupReference.execute();
            cleanup.add(cleanupReference);

            cleanupReference.add(Cleanup.fromCurrentProperties(reference.style, ['height']));

            runtimeMessage$.pipe(
              filter((message) => message.type === 'RESIZE_REFERENCE'),
              takeUntil(cleanupReference.executed$),
            ).subscribe((message) => {
              reference.style.height = `${message.height + referenceSizeAdjustmentOptions.additionalHeight}px`;
            });
          });

          break;
        }
      }
    }
  });
};

export default referenceSizeAdjustment;
