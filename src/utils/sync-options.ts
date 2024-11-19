import { z } from 'zod';

export const MovieTimePageOptions = z.object({
  enabled: z.boolean().describe('有効'),
});

export type MovieTimePageOptions = z.infer<typeof MovieTimePageOptions>;

export const createMovieTimeListPageOptions = (anchorDestination: string) => z.object({
  ...MovieTimePageOptions.shape,
  anchorSelectors: z
    .string()
    .describe(`[Advanced] ${anchorDestination}へのURLを持つ<a>へのCSSセレクター`),
  parentRelativeSelectors: z
    .string()
    .describe('[Advanced] 動画時間表示の親要素への<a>からの相対CSSセレクター'),
});

export type MovieTimeListPageOptions = z.infer<ReturnType<typeof createMovieTimeListPageOptions>>;

export const createMovieTimeListPageOptionsWithSummary = (anchorDestination: string) => z.object({
  ...createMovieTimeListPageOptions(anchorDestination).shape,
  summaryParentSelectors: z
    .string()
    .describe('[Advanced] 取得した全チャプター合計動画時間表示の親要素'),
});

export type MovieTimeListPageOptionsWithSummary = z.infer<ReturnType<typeof createMovieTimeListPageOptionsWithSummary>>;

export const SyncOptionsV1 = z
  .object({
    version: z.literal(1),
    user: z.object({
      movieTime: z
        .object({
          timeout: z.coerce.number().describe('要素取得のタイムアウト [ms]'),
          pages: z
            .object({
              course: createMovieTimeListPageOptionsWithSummary('チャプターページ')
                .describe('コースページ'),
              chapter: z.object({
                ...MovieTimePageOptions.shape,
                parentSelectors: z
                  .string()
                  .describe('[Advanced] 動画時間表示の親要素へのCSSセレクター'),
                expanderSelectors: z
                  .string()
                  .describe('[Advanced] 教材モーダルを開く/閉じるボタンへのCSSセレクター'),
              }).describe('チャプターページ'),
              myCourse: createMovieTimeListPageOptions('コースページ')
                .describe('マイコースページ (大量の通信が必要なため、常時有効にするのは推奨されない)'),
              myCourseReport: createMovieTimeListPageOptions('月間レポートページ')
                .describe('マイコースページ - レポート (大量の通信が必要なため、常時有効にするのは推奨されない)'),
              monthlyReports: createMovieTimeListPageOptionsWithSummary('チャプターページ')
                .describe('月間レポートページ'),
            })
            .describe('ページ'),
        })
        .describe('動画合計時間表示'),
    }),
  });

export type SyncOptionsV1 = z.infer<typeof SyncOptionsV1>;

export const HistoricalSyncOptions = z.union([
  SyncOptionsV1,
  z.never(),
]);

export type HistoricalSyncOptions = z.infer<typeof HistoricalSyncOptions>;

export const SyncOptions = SyncOptionsV1;
export type SyncOptions = SyncOptionsV1;

export const UserOptions = SyncOptions.shape.user;
export type UserOptions = z.infer<typeof UserOptions>;

export const defaultSyncOptions: SyncOptions = {
  version: 1,
  user: {
    movieTime: {
      timeout: 5000,
      pages: {
        course: {
          enabled: true,
          parentRelativeSelectors: ':scope > *',
          anchorSelectors: '[aria-label="チャプター一覧"] a:has(h4)',
          summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
        },
        chapter: {
          enabled: true,
          parentSelectors: ':has(> [aria-label$="教材リスト"]) > div:nth-child(1):not(:has([aria-label="教材フィルタ"]))',
          expanderSelectors: '[aria-label="教材モーダル"] :where([aria-label="縮小する"], [aria-label="拡大する"])',
        },
        myCourse: {
          enabled: false,
          parentRelativeSelectors: 'h4',
          anchorSelectors: '[aria-label="コース一覧"] a:has(h4)',
        },
        myCourseReport: {
          enabled: false,
          parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(1)',
          anchorSelectors: 'a[aria-label$="のレポート"]',
        },
        monthlyReports: {
          enabled: true,
          parentRelativeSelectors: ':scope > :nth-child(1) > :nth-child(2)',
          anchorSelectors: 'a:has([aria-label^="進捗度"])',
          summaryParentSelectors: '[type=flow] > [direction=column] > [direction=row]',
        },
      },
    },
  },
};

export const migrateHistoricalSyncOptions = (options: HistoricalSyncOptions): SyncOptions => {
  switch (options.version) {
    case 1:
      return options;
  }
};
