import type { ContentFeature } from '../pages';
import { combineLatest, debounceTime, distinctUntilChanged, filter, fromEvent, startWith, takeUntil, timer } from 'rxjs';
import { cleanable, Cleanup } from '../../utils/cleanup';
import { intervalQuerySelector } from '../../utils/rxjs-helpers';

const subMaterialSizeAdjustment: ContentFeature = ({ pageContent$, syncOptions$ }) => {
  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const subMaterialSizeAdjustmentOptions = syncOptions.user.subMaterialSizeAdjustment;

    if (!subMaterialSizeAdjustmentOptions.enabled) {
      return;
    }

    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (!sectionPageType) {
      return;
    }

    const { pageInfo } = sectionPageType;

    if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
      return;
    }

    const iframeSubscription = intervalQuerySelector<HTMLIFrameElement>(
      subMaterialSizeAdjustmentOptions.subMaterialSelectors,
    ).pipe(
      distinctUntilChanged(),
      filter((subMaterial) => !!subMaterial),
      takeUntil(timer(subMaterialSizeAdjustmentOptions.timeout)),
      cleanable(),
    ).subscribe(({ value: subMaterial, cleanup: cleanupSubMaterial, previousCleanup: previousCleanupSubMaterial }) => {
      previousCleanupSubMaterial.execute();
      cleanup.add(cleanupSubMaterial);

      const subMaterialWindow = subMaterial.contentWindow;

      if (!subMaterialWindow) {
        return;
      }

      cleanupSubMaterial.add(Cleanup.fromCurrentProperties(subMaterial.style, ['height']));

      const resizeSubscription = fromEvent(subMaterialWindow, 'resize').pipe(
        debounceTime(100),
        startWith(undefined),
      ).subscribe(() => {
        const subMaterialContentHeight = subMaterialWindow.document.documentElement.getBoundingClientRect().height;
        subMaterial.style.height = `${Math.ceil(subMaterialContentHeight) + subMaterialSizeAdjustmentOptions.additionalHeight}px`;
      });

      cleanupSubMaterial.add(Cleanup.fromSubscription(resizeSubscription));
    });

    cleanup.add(Cleanup.fromSubscription(iframeSubscription));
  });
};

export default subMaterialSizeAdjustment;
