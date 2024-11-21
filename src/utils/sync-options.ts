import { z } from 'zod';

export const MovieTimePageOptions = z.object({
  enabled: z.boolean().describe('有効'),
});

export type MovieTimePageOptions = z.infer<typeof MovieTimePageOptions>;

export const createMovieTimeListPageOptions = (anchorDestination: string) => (
  MovieTimePageOptions.extend({
    anchorSelectors: z
      .string()
      .describe(`[Advanced] ${anchorDestination}へのURLを持つ<a>へのCSSセレクター`),
    parentRelativeSelectors: z
      .string()
      .describe('[Advanced] 動画時間表示の親要素への<a>からの相対CSSセレクター'),
  })
);

export type MovieTimeListPageOptions = z.infer<ReturnType<typeof createMovieTimeListPageOptions>>;

export const createMovieTimeListPageOptionsWithSummary = (anchorDestination: string) => (
  createMovieTimeListPageOptions(anchorDestination).extend({
    summaryParentSelectors: z
      .string()
      .describe('[Advanced] 取得した全チャプター合計動画時間表示の親要素'),
  })
);

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
              chapter: MovieTimePageOptions.extend({
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

export const SyncOptionsV2 = SyncOptionsV1.extend({
  version: z.literal(2),
  user: SyncOptionsV1.shape.user.extend({
    wordCount: z
      .object({
        enabled: z
          .boolean()
          .describe('有効'),
        timeout: z
          .coerce
          .number()
          .describe('要素取得のタイムアウト [ms]'),
        fieldSelectors: z
          .string()
          .describe('[Advanced] カウントする<input>や<textarea>への、セクションフレーム内ドキュメントからのCSSセレクター'),
        counterSelectors: z
          .string()
          .describe('[Advanced] 単語数表示の親要素への、カウントする<input>や<textarea>の親要素からの相対CSSセレクター'),
      })
      .describe('単語数表示'),
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

export const defaultSyncOptions: SyncOptions = {
  version: 2,
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
    wordCount: {
      enabled: true,
      timeout: 5000,
      fieldSelectors: 'input, textarea',
      counterSelectors: ':scope > .indicators div.counter',
    },
  },
};

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
