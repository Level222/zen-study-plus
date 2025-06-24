import type defaults from 'defaults';
import type { PartialDeep } from 'type-fest';
import type { fallbackSyncOptions } from './default-options';
import { z } from 'zod';
import { defaultSyncOptions } from './default-options';

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

export const HistoricalSyncOptions = z.union([
  SyncOptionsV1,
  SyncOptionsV2,
  SyncOptionsV3,
  SyncOptionsV4,
  SyncOptionsV5,
  SyncOptionsV6,
]);

export type HistoricalSyncOptions = z.infer<typeof HistoricalSyncOptions>;

export const SyncOptions = SyncOptionsV6;
export type SyncOptions = SyncOptionsV6;

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
          wordCount: { ...defaultSyncOptions.user.wordCount },
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
      return {
        ...options,
        version: 6,
        user: {
          ...options.user,
          subMaterialSizeAdjustment: { ...defaultSyncOptions.user.subMaterialSizeAdjustment },
        },
      };
    case 6:
      return options;
  }
};

export type SyncOptionsFallback = typeof fallbackSyncOptions;

export type WithFallback<T extends Record<string, unknown>, U extends PartialDeep<T>> = ReturnType<typeof defaults<T, U>>;

export type SyncOptionsWithFallback = WithFallback<SyncOptions, SyncOptionsFallback>;
