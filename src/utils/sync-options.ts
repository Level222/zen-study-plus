import type defaults from 'defaults';
import type { PartialDeep } from 'type-fest';
import type { fallbackSyncOptions } from './default-options';
import { z } from 'zod';
import { defaultSyncOptions } from './default-options';
import { omit } from './helpers';

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

export const KeyboardShortcutOptions = z.object({
  patterns: z.string().optional(),
});

export type KeyboardShortcutOptions = z.infer<typeof KeyboardShortcutOptions>;

export const SyncOptionsV1 = z.object({
  version: z.literal(1),
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
  }),
});

export type SyncOptionsV1 = z.infer<typeof SyncOptionsV1>;

export const SyncOptionsV2 = SyncOptionsV1.extend({
  version: z.literal(2),
  user: SyncOptionsV1.shape.user.extend({
    wordCount: z.object({
      enabled: z.boolean(),
      timeout: z.number(),
      fieldSelectors: z.string().optional(),
      counterSelectors: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV2 = z.infer<typeof SyncOptionsV2>;

export const SyncOptionsV3 = SyncOptionsV2.extend({
  version: z.literal(3),
  user: SyncOptionsV2.shape.user.extend({
    keyboardShortcuts: z.object({
      shortcuts: z.object({
        playOrPause: KeyboardShortcutOptions,
        seekBackward: KeyboardShortcutOptions.extend({
          seconds: z.number(),
        }),
        seekForward: KeyboardShortcutOptions.extend({
          seconds: z.number(),
        }),
        mute: KeyboardShortcutOptions,
        fullscreen: KeyboardShortcutOptions,
        pictureInPicture: KeyboardShortcutOptions,
        previousSection: KeyboardShortcutOptions,
        nextSection: KeyboardShortcutOptions,
      }),
      defaultShortcutsToDisable: KeyboardShortcutOptions,
      ignoreTargetSelectors: z.string().optional(),
    }),
    pageComponents: z.object({
      sectionVideoSelectors: z.string().optional(),
      chapterSectionListItemsSelectors: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV3 = z.infer<typeof SyncOptionsV3>;

export const SyncOptionsV4 = SyncOptionsV3.extend({
  version: z.literal(4),
  user: SyncOptionsV3.shape.user.extend({
    disableMathJaxFocus: z.object({
      enabled: z.boolean(),
      mathJaxElementSelectors: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV4 = z.infer<typeof SyncOptionsV4>;

export const SyncOptionsV5 = SyncOptionsV4.extend({
  version: z.literal(5),
  user: SyncOptionsV4.shape.user.extend({
    movieTime: SyncOptionsV4.shape.user.shape.movieTime.extend({
      myCourseSectionsWrapper: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV5 = z.infer<typeof SyncOptionsV5>;

export const SyncOptionsV6 = SyncOptionsV5.extend({
  version: z.literal(6),
  user: SyncOptionsV5.shape.user.extend({
    subMaterialSizeAdjustment: z.object({
      enabled: z.boolean(),
      additionalHeight: z.number(),
      timeout: z.number(),
      subMaterialSelectors: z.string().optional(),
    }),
  }),
});

export type SyncOptionsV6 = z.infer<typeof SyncOptionsV6>;

export const SyncOptionsV7 = SyncOptionsV6.extend({
  version: z.literal(7),
  user: SyncOptionsV6.shape.user.extend({
    disableStickyMovie: z.object({
      enabled: z.boolean(),
    }),
  }),
});

export type SyncOptionsV7 = z.infer<typeof SyncOptionsV7>;

export const SyncOptionsV8 = SyncOptionsV7.extend({
  version: z.literal(8),
  user: SyncOptionsV7.shape.user.extend({
    keyboardShortcuts: SyncOptionsV7.shape.user.shape.keyboardShortcuts.extend({
      videoShortcutTimeout: z.number(),
    }),
  }),
});

export type SyncOptionsV8 = z.infer<typeof SyncOptionsV8>;

export const SyncOptionsV9 = SyncOptionsV8.extend({
  version: z.literal(9),
  user: SyncOptionsV8.shape.user
    .omit({ subMaterialSizeAdjustment: true })
    .extend({
      referenceSizeAdjustment: SyncOptionsV7.shape.user.shape.subMaterialSizeAdjustment
        .omit({ subMaterialSelectors: true })
        .extend({
          referenceSelectors: SyncOptionsV7.shape.user.shape.subMaterialSizeAdjustment.shape.subMaterialSelectors,
          maxHeight: z.number(),
        }),
    }),
});

export type SyncOptionsV9 = z.infer<typeof SyncOptionsV9>;

export const SyncOptionsV10 = SyncOptionsV9.extend({
  version: z.literal(10),
  user: SyncOptionsV9.shape.user.extend({
    movieTime: SyncOptionsV9.shape.user.shape.movieTime
      .extend({
        pages: SyncOptionsV9.shape.user.shape.movieTime.shape.pages.extend({
          chapter: SyncOptionsV9.shape.user.shape.movieTime.shape.pages.shape.chapter.omit({
            expanderSelectors: true,
          }),
        }),
      })
      .omit({
        timeout: true,
      }),
    wordCount: SyncOptionsV9.shape.user.shape.wordCount.omit({
      timeout: true,
    }),
    referenceSizeAdjustment: SyncOptionsV9.shape.user.shape.referenceSizeAdjustment.omit({
      timeout: true,
    }),
  }),
});

export type SyncOptionsV10 = z.infer<typeof SyncOptionsV10>;

export const HistoricalSyncOptions = z.union([
  SyncOptionsV1,
  SyncOptionsV2,
  SyncOptionsV3,
  SyncOptionsV4,
  SyncOptionsV5,
  SyncOptionsV6,
  SyncOptionsV7,
  SyncOptionsV8,
  SyncOptionsV9,
  SyncOptionsV10,
]);

export type HistoricalSyncOptions = z.infer<typeof HistoricalSyncOptions>;

export const SyncOptions = SyncOptionsV10;
export type SyncOptions = SyncOptionsV10;

export const UserOptions = SyncOptions.shape.user;
export type UserOptions = z.infer<typeof UserOptions>;

export const migrateHistoricalSyncOptions = (options: HistoricalSyncOptions): SyncOptions => {
  switch (options.version) {
    case 1:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 2,
        user: {
          ...options.user,
          // timeout option is deprecated
          wordCount: { ...defaultSyncOptions.user.wordCount, timeout: 0 },
        },
      });
    case 2:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 3,
        user: {
          ...options.user,
          keyboardShortcuts: { ...defaultSyncOptions.user.keyboardShortcuts },
          pageComponents: { ...defaultSyncOptions.user.pageComponents },
        },
      });
    case 3:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 4,
        user: {
          ...options.user,
          disableMathJaxFocus: { ...defaultSyncOptions.user.disableMathJaxFocus },
        },
      });
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
          ...options.user,
          // timeout option is deprecated
          subMaterialSizeAdjustment: { ...defaultSyncOptions.user.referenceSizeAdjustment, timeout: 0 },
        },
      });
    case 6:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 7,
        user: {
          ...options.user,
          disableStickyMovie: { ...defaultSyncOptions.user.disableStickyMovie },
        },
      });
    case 7:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 8,
        user: {
          ...options.user,
          keyboardShortcuts: {
            ...options.user.keyboardShortcuts,
            videoShortcutTimeout: defaultSyncOptions.user.keyboardShortcuts.videoShortcutTimeout,
          },
        },
      });
    case 8:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 9,
        user: {
          ...omit(options.user, ['subMaterialSizeAdjustment']),
          referenceSizeAdjustment: {
            ...omit(options.user.subMaterialSizeAdjustment, ['subMaterialSelectors']),
            referenceSelectors: options.user.subMaterialSizeAdjustment.subMaterialSelectors,
            maxHeight: defaultSyncOptions.user.referenceSizeAdjustment.maxHeight,
          },
        },
      });
    case 9:
      return migrateHistoricalSyncOptions({
        ...options,
        version: 10,
        user: {
          ...options.user,
          movieTime: {
            ...omit(options.user.movieTime, ['timeout']),
            pages: {
              ...options.user.movieTime.pages,
              chapter: omit(options.user.movieTime.pages.chapter, ['expanderSelectors']),
            },
          },
          wordCount: omit(options.user.wordCount, ['timeout']),
          referenceSizeAdjustment: omit(options.user.referenceSizeAdjustment, ['timeout']),
        },
      });
    case 10:
      return options;
  }
};

export type SyncOptionsFallback = typeof fallbackSyncOptions;

export type WithFallback<T extends Record<string, unknown>, U extends PartialDeep<T>> = ReturnType<typeof defaults<T, U>>;

export type SyncOptionsWithFallback = WithFallback<SyncOptions, SyncOptionsFallback>;
