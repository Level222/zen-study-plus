import type { ParsedPattern } from '../../utils/shortcut-keys';
import type { KeyboardShortcutItemOptions, SyncOptionsWithFallback } from '../../utils/sync-options';
import type { PageContent } from '../pages';
import { fromEvent, map, take, takeUntil, timer } from 'rxjs';

type ShortcutsOptions = SyncOptionsWithFallback['user']['keyboardShortcuts']['shortcuts'];

export type ShortcutExecution<T extends KeyboardShortcutItemOptions = KeyboardShortcutItemOptions> = {
  options: T;
  parsedPatterns: ParsedPattern[];
  pageContent: PageContent;
  syncOptions: SyncOptionsWithFallback;
};

export type Shortcut<T extends ShortcutExecution> = (options: T) => void;

type NormalVideoShortcutDetail<T> = {
  video: HTMLVideoElement;
  syncOptions: SyncOptionsWithFallback;
  options: T;
};

const createNormalVideoShortcut = <T extends KeyboardShortcutItemOptions>(
  callback: (detail: NormalVideoShortcutDetail<T>) => void,
): Shortcut<ShortcutExecution<T>> => {
  return async ({ pageContent, syncOptions, options }) => {
    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (!sectionPageType) {
      return;
    }

    const { pageInfo } = sectionPageType;

    if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
      return;
    }

    const video = document.querySelector(syncOptions.user.commonComponents.sectionVideoSelectors);

    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      callback({ video, syncOptions, options });
    } else {
      fromEvent(video, 'loadedmetadata').pipe(
        takeUntil(timer(syncOptions.user.keyboardShortcuts.videoShortcutTimeout)),
        take(1),
        map(() => video),
      ).subscribe(() => {
        callback({ video, syncOptions, options });
      });
    }
  };
};

const createSectionMoveShortcut = <T extends KeyboardShortcutItemOptions>(
  relativePosition: number,
): Shortcut<ShortcutExecution<T>> => {
  return ({ pageContent, syncOptions }) => {
    if (!pageContent.types.find((pageType) => pageType.name === 'CHAPTER')) {
      return;
    }

    const sectionListItems = [...document.querySelectorAll<HTMLDivElement>(
      syncOptions.user.keyboardShortcuts.sectionListItemSelectors,
    )];

    if (!sectionListItems.length) {
      return;
    }

    let targetItemIndex: number | undefined;

    const sectionListItemStyles = sectionListItems.map((item) => getComputedStyle(item));
    const currentItemIndex = sectionListItemStyles.findIndex((style) => style.boxShadow !== 'none');

    if (currentItemIndex === -1) {
      if (relativePosition >= 0) {
        targetItemIndex = 0;
      } else {
        const firstDisabledItemIndex = sectionListItemStyles.findIndex((style) => style.pointerEvents === 'none');
        targetItemIndex = firstDisabledItemIndex === -1 ? sectionListItems.length - 1 : firstDisabledItemIndex - 1;
      }
    } else {
      targetItemIndex = Math.max(Math.min(currentItemIndex + relativePosition, sectionListItems.length - 1), 0);
    }

    if (targetItemIndex !== currentItemIndex) {
      sectionListItems[targetItemIndex].click();
    }
  };
};

const shortcuts: {
  [K in keyof ShortcutsOptions]: Shortcut<ShortcutExecution<ShortcutsOptions[K]>>
} = {
  playOrPause: createNormalVideoShortcut(({ video }) => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }),
  seekBackward: createNormalVideoShortcut(({ video, options }) => {
    video.currentTime = video.currentTime - options.seconds;
  }),
  seekForward: createNormalVideoShortcut(({ video, options }) => {
    video.currentTime = video.currentTime + options.seconds;
  }),
  mute: createNormalVideoShortcut(({ video }) => {
    video.muted = !video.muted;
  }),
  fullscreen: createNormalVideoShortcut(({ video }) => {
    if (document.fullscreenElement === video) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }),
  pictureInPicture: createNormalVideoShortcut(({ video }) => {
    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  }),
  theaterMode: ({ pageContent, syncOptions }) => {
    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (
      !sectionPageType
      || sectionPageType.pageInfo.type !== 'CHAPTER_RESOURCE'
      || sectionPageType.pageInfo.resourceType !== 'movies'
    ) {
      return;
    }

    const theaterModeButton = document.querySelector(syncOptions.user.keyboardShortcuts.theaterModeButtonSelectors);

    if (theaterModeButton instanceof HTMLElement) {
      theaterModeButton.click();
    }
  },
  expandSection: ({ pageContent, syncOptions }) => {
    if (!pageContent.types.find((pageType) => pageType.name === 'CHAPTER')) {
      return;
    }

    const expandButton = document.querySelector(syncOptions.user.keyboardShortcuts.expandButtonSelectors);

    if (expandButton instanceof HTMLElement) {
      expandButton.click();
    }
  },
  previousSection: createSectionMoveShortcut(-1),
  nextSection: createSectionMoveShortcut(1),
};

export default shortcuts;
