import type { ParsedPattern } from '../../utils/shortcut-keys';
import type { KeyboardShortcutItemOptions, SyncOptionsWithFallback } from '../../utils/sync-options';
import type { PageContent } from '../pages';
import { firstValueFrom, fromEvent, map, take, takeUntil, timer } from 'rxjs';

type KeyboardShortcutsOptions = SyncOptionsWithFallback['user']['keyboardShortcuts'];
type ShortcutsOptions = KeyboardShortcutsOptions['shortcuts'];

export type ShortcutExecution<T extends KeyboardShortcutItemOptions = KeyboardShortcutItemOptions> = {
  options: T;
  parsedPatterns: ParsedPattern[];
  pageContent: PageContent;
  keyboardShortcutsOptions: KeyboardShortcutsOptions;
};

export type Shortcut<T extends ShortcutExecution> = (options: T) => void;

const getVideoFromDocument = (
  pageContent: PageContent,
  keyboardShortcutsOptions: KeyboardShortcutsOptions,
): Promise<HTMLVideoElement | undefined> => {
  const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

  if (!sectionPageType) {
    return Promise.resolve(undefined);
  }

  const { pageInfo } = sectionPageType;

  if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
    return Promise.resolve(undefined);
  }

  const video = document.querySelector<HTMLVideoElement>(keyboardShortcutsOptions.sectionVideoSelectors);

  if (!video) {
    return Promise.resolve(undefined);
  }

  if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    return firstValueFrom(
      fromEvent(video, 'loadedmetadata').pipe(
        takeUntil(timer(keyboardShortcutsOptions.videoShortcutTimeout)),
        take(1),
        map(() => video),
      ),
      { defaultValue: undefined },
    );
  }

  return Promise.resolve(video);
};

const clickRelativeSectionListItem = (
  relativePosition: number,
  pageContent: PageContent,
  keyboardShortcutsOptions: KeyboardShortcutsOptions,
) => {
  if (!pageContent.types.find((pageType) => pageType.name === 'CHAPTER')) {
    return;
  }

  const sectionListItems = [...document.querySelectorAll<HTMLDivElement>(
    keyboardShortcutsOptions.sectionListItemSelectors,
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

const shortcuts: {
  [K in keyof ShortcutsOptions]: Shortcut<ShortcutExecution<ShortcutsOptions[K]>>
} = {
  playOrPause: async ({ pageContent, keyboardShortcutsOptions }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  },
  seekBackward: async ({ pageContent, keyboardShortcutsOptions, options }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (video) {
      video.currentTime = video.currentTime - options.seconds;
    }
  },
  seekForward: async ({ pageContent, keyboardShortcutsOptions, options }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (video) {
      video.currentTime = video.currentTime + options.seconds;
    }
  },
  mute: async ({ pageContent, keyboardShortcutsOptions }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (video) {
      video.muted = !video.muted;
    }
  },
  fullscreen: async ({ pageContent, keyboardShortcutsOptions }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (!video) {
      return;
    }

    if (document.fullscreenElement === video) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  },
  pictureInPicture: async ({ pageContent, keyboardShortcutsOptions }) => {
    const video = await getVideoFromDocument(pageContent, keyboardShortcutsOptions);

    if (!video) {
      return;
    }

    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  },
  theaterMode: ({ pageContent, keyboardShortcutsOptions }) => {
    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (
      !sectionPageType
      || sectionPageType.pageInfo.type !== 'CHAPTER_RESOURCE'
      || sectionPageType.pageInfo.resourceType !== 'movies'
    ) {
      return;
    }

    const theaterModeButton = document.querySelector(keyboardShortcutsOptions.theaterModeButtonSelectors);

    if (theaterModeButton instanceof HTMLElement) {
      theaterModeButton.click();
    }
  },
  expandSection: ({ pageContent, keyboardShortcutsOptions }) => {
    if (!pageContent.types.find((pageType) => pageType.name === 'CHAPTER')) {
      return;
    }

    const expandButton = document.querySelector(keyboardShortcutsOptions.expandButtonSelectors);

    if (expandButton instanceof HTMLElement) {
      expandButton.click();
    }
  },
  previousSection: ({ pageContent, keyboardShortcutsOptions }) => {
    clickRelativeSectionListItem(-1, pageContent, keyboardShortcutsOptions);
  },
  nextSection: ({ pageContent, keyboardShortcutsOptions }) => {
    clickRelativeSectionListItem(1, pageContent, keyboardShortcutsOptions);
  },
};

export default shortcuts;
