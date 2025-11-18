import type { ContentFeature } from '../pages';
import { combineLatest, filter, fromEvent, switchMap, takeUntil } from 'rxjs';
import { AdditionalStylesheet, cleanable } from '../../utils/cleanup';

const modifyStickyMovie: ContentFeature = ({ pageContent$, syncOptions$, mutationSelector }) => {
  const sheet = new AdditionalStylesheet();

  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const modifyStickyMovieOptions = syncOptions.user.modifyStickyMovie;

    if (!modifyStickyMovieOptions.enabled) {
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

    switch (modifyStickyMovieOptions.modifyMode) {
      case 'ORIGINAL_MODIFIED': {
        // 動画を固定表示するかどうかは動画の高さによっても決まる。
        // 動画が読み込まれるまでは仮の高さを設定し、最初の動画の固定表示決定時に動画に高さが
        // あるようにする。
        sheet.replaceRules([`
          ${syncOptions.user.commonComponents.sectionVideoSelectors} {
            aspect-ratio: 16 / 9;
          }
        `]);

        // 動画の大きさが変更された後は仮の高さを解除し、強制的に再度動画の固定表示決定をさせる。
        mutationSelector.selector(syncOptions.user.commonComponents.sectionVideoSelectors).pipe(
          filter((video) => video instanceof HTMLVideoElement),
          switchMap((video) => fromEvent(video, 'resize')),
          takeUntil(cleanup.executed$),
        ).subscribe(() => {
          sheet.remove();
          window.dispatchEvent(new Event('resize'));
        });

        break;
      }

      case 'DISABLE': {
        sheet.replaceRules([`
          ${modifyStickyMovieOptions.playerNotInTheaterModeSelectors} {
            position: relative;
            inset: 0;
          }
        `]);

        break;
      }
    }

    cleanup.add(
      sheet.insert(),
    );
  });
};

export default modifyStickyMovie;
