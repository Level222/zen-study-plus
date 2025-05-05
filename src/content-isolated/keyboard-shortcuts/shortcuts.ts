import type { ParsedPattern } from '../../utils/shortcut-keys';
import type { KeyboardShortcutOptions, SyncOptionsWithFallback } from '../../utils/sync-options';
import type { PageContent } from '../pages';

export type ShortcutExecution<T extends KeyboardShortcutOptions = KeyboardShortcutOptions> = {
  options: T;
  parsedPatterns: ParsedPattern[];
  pageContent: PageContent;
  syncOptions: SyncOptionsWithFallback;
};

export type Shortcut<T extends ShortcutExecution> = (options: T) => void;

type ShortcutsOptions = SyncOptionsWithFallback['user']['keyboardShortcuts']['shortcuts'];

const clickRelativeSectionListItem = (relativePosition: number, syncOptions: SyncOptionsWithFallback) => {
  const sectionListItems = [...document.querySelectorAll<HTMLDivElement>(
    syncOptions.user.pageComponents.chapterSectionListItemsSelectors,
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

const getVideoFromDocument = (
  pageContent: PageContent,
  syncOptions: SyncOptionsWithFallback,
): HTMLVideoElement | undefined => {
  const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

  if (!sectionPageType) {
    return;
  }

  const { pageInfo } = sectionPageType;

  if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
    return;
  }

  const video = document.querySelector<HTMLVideoElement>(syncOptions.user.pageComponents.sectionVideoSelectors);

  return video ?? undefined;
};

const shortcuts: {
  [K in keyof ShortcutsOptions]: Shortcut<ShortcutExecution<ShortcutsOptions[K]>>
} = {
  playOrPause: ({ pageContent, syncOptions }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  },
  seekBackward: ({ pageContent, syncOptions, options }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (video) {
      video.currentTime = video.currentTime - options.seconds;
    }
  },
  seekForward: ({ pageContent, syncOptions, options }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (video) {
      video.currentTime = video.currentTime + options.seconds;
    }
  },
  mute: ({ pageContent, syncOptions }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (video) {
      video.muted = !video.muted;
    }
  },
  fullscreen: ({ pageContent, syncOptions }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (!video) {
      return;
    }

    if (document.fullscreenElement === video) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  },
  pictureInPicture: ({ pageContent, syncOptions }) => {
    const video = getVideoFromDocument(pageContent, syncOptions);

    if (!video) {
      return;
    }

    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  },
  previousSection: ({ syncOptions }) => {
    clickRelativeSectionListItem(-1, syncOptions);
  },
  nextSection: ({ syncOptions }) => {
    clickRelativeSectionListItem(1, syncOptions);
  },
};

export default shortcuts;
