import type defaults from 'defaults';
import type { PartialDeep } from 'type-fest';
import type { fallbackSyncOptions } from './default-options';
import { z } from 'zod';
import { defaultSyncOptions } from './default-options';
import { omit } from './helpers';
import { parsePatterns } from './shortcut-keys';

// オプションの変更方法
// 1. 一つ前のバージョンのオプションを `extend` して変更を加える
// 2. `HistoricalSyncOptions` に新バージョンのオプション追加
// 3. `SyncOptions` を新バージョンのオプションに変更
// 4. `utils/default-options.ts` の既定値を変更
// 5. `migrateHistoricalSyncOptions` に前バージョンからの移行を追加
// 6. `options-ui/user-options-with-field.ts` にオプションの説明等を追加

export const MovieTimePageOptions = z.object({
  enabled: z.boolean(),
});

export type MovieTimePageOptions = z.infer<typeof MovieTimePageOptions>;

export const MovieTimeListPageOptions = MovieTimePageOptions.extend({
  anchorSelectors: z.string().optional(),
  parentRelativeSelectors: z.string().optional(),
});

export type MovieTimeListPageOptions = z.infer<typeof MovieTimeListPageOptions>;

export type MovieTimeListPageOptionsRequired = Required<MovieTimeListPageOptions>;

export const MovieTimeListPageOptionsWithSummary = MovieTimeListPageOptions.extend({
  summaryParentSelectors: z.string().optional(),
});

export type MovieTimeListPageOptionsWithSummary = z.infer<typeof MovieTimeListPageOptionsWithSummary>;

export type MovieTimeListPageOptionsWithSummaryRequired = Required<MovieTimeListPageOptionsWithSummary>;

export const KeyboardShortcutItemOptions = z.object({
  patterns: z.string().optional().superRefine((patterns, ctx) => {
    if (patterns) {
      try {
        parsePatterns(patterns);
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }),
});

export type KeyboardShortcutItemOptions = z.infer<typeof KeyboardShortcutItemOptions>;

/**
 * Release in v1.0.0
 */
export const SyncOptionsV4 = z.object({
  version: z.literal(4),
  user: z.object({
    movieTime: z.object({
      timeout: z.number(),
      pages: z.object({
        course: MovieTimeListPageOptionsWithSummary,
        chapter: MovieTimePageOptions.extend({
          parentSelectors: z.string().optional(),
          expanderSelectors: z.string().optional(),
        }),
        myCourse: MovieTimeListPageOptions,
        myCourseReport: MovieTimeListPageOptions,
        monthlyReports: MovieTimeListPageOptionsWithSummary,
      }),
    }),
    wordCount: z.object({
      enabled: z.boolean(),
      timeout: z.number(),
      fieldSelectors: z.string().optional(),
      counterSelectors: z.string().optional(),
    }),
    keyboardShortcuts: z.object({
      shortcuts: z.object({
        playOrPause: KeyboardShortcutItemOptions,
        seekBackward: KeyboardShortcutItemOptions.extend({
          seconds: z.number(),
        }),
        seekForward: KeyboardShortcutItemOptions.extend({
          seconds: z.number(),
        }),
        mute: KeyboardShortcutItemOptions,
        fullscreen: KeyboardShortcutItemOptions,
        pictureInPicture: KeyboardShortcutItemOptions,
        previousSection: KeyboardShortcutItemOptions,
        nextSection: KeyboardShortcutItemOptions,
      }),
      defaultShortcutsToDisable: KeyboardShortcutItemOptions,
      ignoreTargetSelectors: z.string().optional(),
    }),
    pageComponents: z.object({
      sectionVideoSelectors: z.string().optional(),
      chapterSectionListItemsSelectors: z.string().optional(),
    }),
    disableMathJaxFocus: z.object({
      enabled: z.boolean(),
      mathJaxElementSelectors: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV4 = z.infer<typeof SyncOptionsV4>;

/**
 * Release in v1.0.2
 */
export const SyncOptionsV5 = SyncOptionsV4.extend({
  version: z.literal(5),
  user: SyncOptionsV4.shape.user.extend({
    movieTime: SyncOptionsV4.shape.user.shape.movieTime.extend({
      myCourseSectionsWrapper: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV5 = z.infer<typeof SyncOptionsV5>;

/**
 * Release in v1.1.0
 */
export const SyncOptionsV6 = SyncOptionsV5.extend({
  version: z.literal(6),
  user: SyncOptionsV5.shape.user
    .omit({ pageComponents: true })
    .extend({
      movieTime: SyncOptionsV5.shape.user.shape.movieTime
        .omit({
          timeout: true,
        })
        .extend({
          pages: SyncOptionsV5.shape.user.shape.movieTime.shape.pages.extend({
            chapter: SyncOptionsV5.shape.user.shape.movieTime.shape.pages.shape.chapter.omit({
              expanderSelectors: true,
            }),
          }),
        }),
      wordCount: SyncOptionsV5.shape.user.shape.wordCount.omit({
        timeout: true,
      }),
      keyboardShortcuts: SyncOptionsV5.shape.user.shape.keyboardShortcuts.extend({
        shortcuts: SyncOptionsV5.shape.user.shape.keyboardShortcuts.shape.shortcuts.extend({
          theaterMode: KeyboardShortcutItemOptions,
          expandSection: KeyboardShortcutItemOptions,
        }),
        videoShortcutTimeout: z.number(),
        sectionVideoSelectors: z.string().optional(),
        theaterModeButtonSelectors: z.string().optional(),
        expandButtonSelectors: z.string().optional(),
        sectionListItemSelectors: z.string().optional(),
      }),
      referenceSizeAdjustment: z.object({
        enabled: z.boolean(),
        additionalHeight: z.number(),
        maxHeight: z.number(),
        referenceSelectors: z.string().optional(),
      }),
      disableStickyMovie: z.object({
        enabled: z.boolean(),
      }),
    }),
});

export type SyncOptionsV6 = z.infer<typeof SyncOptionsV6>;

/**
 * Release in 1.2.0
 */
export const SyncOptionsV7 = SyncOptionsV6.extend({
  version: z.literal(7),
  user: SyncOptionsV6.shape.user
    .omit({ disableStickyMovie: true })
    .extend({
      keyboardShortcuts: SyncOptionsV6.shape.user.shape.keyboardShortcuts.omit({
        sectionVideoSelectors: true,
      }),
      modifyStickyMovie: SyncOptionsV6.shape.user.shape.disableStickyMovie.extend({
        modifyMode: z.enum(['ORIGINAL_MODIFIED', 'DISABLE']),
        playerNotInTheaterModeSelectors: z.string().optional(),
      }),
      commonComponents: z.object({
        sectionVideoSelectors: z.string().optional(),
      }),
    }),
});

export type SyncOptionsV7 = z.infer<typeof SyncOptionsV7>;

export const HistoricalSyncOptions = z.union([
  SyncOptionsV4,
  SyncOptionsV5,
  SyncOptionsV6,
  SyncOptionsV7,
]);

export type HistoricalSyncOptions = z.infer<typeof HistoricalSyncOptions>;

export const SyncOptions = SyncOptionsV7;
export type SyncOptions = SyncOptionsV7;

export const UserOptions = SyncOptions.shape.user;
export type UserOptions = z.infer<typeof UserOptions>;

export const migrateHistoricalSyncOptions = (options: HistoricalSyncOptions): SyncOptions => {
  switch (options.version) {
    case 4:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 5,
        user: {
          ...options.user,
          movieTime: {
            ...options.user.movieTime,
            myCourseSectionsWrapper: defaultSyncOptions.user.movieTime.myCourseSectionsWrapper,
            pages: {
              ...options.user.movieTime.pages,
              myCourse: {
                ...options.user.movieTime.pages.myCourse,
                enabled: true,
              },
              myCourseReport: {
                ...options.user.movieTime.pages.myCourseReport,
                enabled: true,
              },
            },
          },
        },
      });
    case 5:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 6,
        user: {
          ...omit(options.user, ['pageComponents']),
          movieTime: {
            ...omit(options.user.movieTime, ['timeout']),
            pages: {
              ...options.user.movieTime.pages,
              chapter: omit(options.user.movieTime.pages.chapter, ['expanderSelectors']),
            },
          },
          wordCount: omit(options.user.wordCount, ['timeout']),
          keyboardShortcuts: {
            ...options.user.keyboardShortcuts,
            shortcuts: {
              ...options.user.keyboardShortcuts.shortcuts,
              theaterMode: defaultSyncOptions.user.keyboardShortcuts.shortcuts.theaterMode,
              expandSection: defaultSyncOptions.user.keyboardShortcuts.shortcuts.expandSection,
            },
            videoShortcutTimeout: defaultSyncOptions.user.keyboardShortcuts.videoShortcutTimeout,
            sectionVideoSelectors: options.user.pageComponents.sectionVideoSelectors,
            expandButtonSelectors: options.user.movieTime.pages.chapter.expanderSelectors,
            sectionListItemSelectors: options.user.pageComponents.chapterSectionListItemsSelectors,
          },
          referenceSizeAdjustment: defaultSyncOptions.user.referenceSizeAdjustment,
          disableStickyMovie: defaultSyncOptions.user.modifyStickyMovie,
        },
      });
    case 6:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 7,
        user: {
          ...options.user,
          keyboardShortcuts: omit(options.user.keyboardShortcuts, ['sectionVideoSelectors']),
          modifyStickyMovie: {
            ...options.user.disableStickyMovie,
            ...defaultSyncOptions.user.modifyStickyMovie,
          },
          commonComponents: {
            sectionVideoSelectors: options.user.keyboardShortcuts.sectionVideoSelectors,
          },
        },
      });
    case 7:
      return options;
  }
};

export type SyncOptionsFallback = typeof fallbackSyncOptions;

export type WithFallback<T extends Record<string, unknown>, U extends PartialDeep<T>> = ReturnType<typeof defaults<T, U>>;

export type SyncOptionsWithFallback = WithFallback<SyncOptions, SyncOptionsFallback>;
