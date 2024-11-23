import type defaults from 'defaults';
import type { fallbackSyncOptions } from './default-options';
import type { DeepPartial } from './helpers';
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

export const HistoricalSyncOptions = z.union([
  SyncOptionsV1,
  SyncOptionsV2,
]);

export type HistoricalSyncOptions = z.infer<typeof HistoricalSyncOptions>;

export const SyncOptions = SyncOptionsV2;
export type SyncOptions = SyncOptionsV2;

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
      return options;
  }
};

export type SyncOptionsFallback = typeof fallbackSyncOptions;

export type WithFallback<T extends Record<string, unknown>, U extends DeepPartial<T>> = ReturnType<typeof defaults<T, U>>;

export type SyncOptionsWithFallback = WithFallback<SyncOptions, SyncOptionsFallback>;
