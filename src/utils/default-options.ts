import type { OmitDeep } from 'type-fest';
import type { DeepPickOptional } from './helpers';
import type { SyncOptions } from './sync-options';

/**
 * 全オプションの既定値
 */
export const defaultSyncOptions: SyncOptions = {
  version: 3,
  user: {
    movieTime: {
      timeout: 5000,
      pages: {
        course: {
          enabled: true,
        },
        chapter: {
          enabled: true,
        },
        myCourse: {
          enabled: false,
        },
        myCourseReport: {
          enabled: false,
        },
        monthlyReports: {
          enabled: true,
        },
      },
    },
    wordCount: {
      enabled: true,
      timeout: 5000,
    },
    keyboardShortcuts: {
      shortcuts: {
        playOrPause: {
          patterns: 'K',
        },
        seekBackward: {
          patterns: 'J',
          seconds: 10,
        },
        seekForward: {
          patterns: 'L',
          seconds: 10,
        },
        mute: {
          patterns: 'M',
        },
        fullscreen: {
          patterns: 'F',
        },
        pictureInPicture: {
          patterns: 'P',
        },
        previousSection: {
          patterns: 'Ctrl+Shift+ArrowUp',
        },
        nextSection: {
          patterns: 'Ctrl+Shift+ArrowDown',
        },
      },
      defaultShortcutsToDisable: {},
    },
    pageComponents: {},
  },
};

/**
 * 「空に設定すると既定値を使用」の既定値
 */
export const fallbackSyncOptions = {
  user: {
    movieTime: {
      pages: {
        course: {
          anchorSelectors: '[aria-label="チャプター一覧"] a:has(h4)',
          parentRelativeSelectors: ':scope > *',
          summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
        },
        chapter: {
          parentSelectors: ':has(> [aria-label$="教材リスト"]) > div:nth-child(1):not(:has([aria-label="教材フィルタ"]))',
          expanderSelectors: '[aria-label="教材モーダル"] :where([aria-label="縮小する"], [aria-label="拡大する"])',
        },
        myCourse: {
          anchorSelectors: '[aria-label="コース一覧"] a:has(h4)',
          parentRelativeSelectors: 'h4',
        },
        myCourseReport: {
          anchorSelectors: 'a[aria-label$="のレポート"]',
          parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(1)',
        },
        monthlyReports: {
          anchorSelectors: 'a:has([aria-label^="進捗度"])',
          parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(2)',
          summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
        },
      },
    },
    wordCount: {
      fieldSelectors: 'input, textarea',
      counterSelectors: ':scope > .indicators div.counter',
    },
    keyboardShortcuts: {
      defaultShortcutsToDisable: {
        patterns: 'Any+F,Any+J,Any+K,Any+L,Any+M',
      },
      ignoreTargetSelectors: 'input, textarea',
    },
    pageComponents: {
      sectionVideoSelectors: '#video-player',
      chapterSectionListItemsSelectors: '[aria-label$="教材リスト"] > li > :nth-child(1) > div:nth-child(1)',
    },
  },
} satisfies OmitDeep<
  DeepPickOptional<SyncOptions>,
  | 'user.keyboardShortcuts.shortcuts'
>;
