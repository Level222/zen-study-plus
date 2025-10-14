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
          const resizeSubscription = fromResizeObserver(document.documentElement).pipe(
            startWith(undefined),
          ).pipe(
            map(() => Math.ceil(document.documentElement.getBoundingClientRect().height)),
            // 無限ループを回避
            takeWhile((height) => height < referenceSizeAdjustmentOptions.maxHeight, true),
          ).subscribe((height) => {
            chrome.runtime.sendMessage<RuntimeMessage>({
              type: 'SEND_BACK_RESIZE_REFERENCE',
              sendBackHeight: Math.min(height, referenceSizeAdjustmentOptions.maxHeight),
            });
          });

          cleanup.add(Cleanup.fromSubscription(resizeSubscription));

          break;
        }

        case 'SECTION': {
          if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
            return;
          }

          const iframeSubscription = intervalQuerySelector<HTMLIFrameElement>(
            referenceSizeAdjustmentOptions.referenceSelectors,
          ).pipe(
            distinctUntilChanged(),
            filter((reference) => !!reference),
            takeUntil(timer(referenceSizeAdjustmentOptions.timeout)),
            cleanable(),
          ).subscribe(({ value: reference, cleanup: cleanupReference, previousCleanup: previousCleanupReference }) => {
            previousCleanupReference.execute();
            cleanup.add(cleanupReference);

            cleanupReference.add(Cleanup.fromCurrentProperties(reference.style, ['height']));

            const messageSubscription = runtimeMessage$.pipe(
              filter((message) => message.type === 'RESIZE_REFERENCE'),
            ).subscribe((message) => {
              reference.style.height = `${message.height + referenceSizeAdjustmentOptions.additionalHeight}px`;
            });

            cleanupReference.add(Cleanup.fromSubscription(messageSubscription));
          });

          cleanup.add(Cleanup.fromSubscription(iframeSubscription));

          break;
        }
      }
    }
  });
};

export default referenceSizeAdjustment;
