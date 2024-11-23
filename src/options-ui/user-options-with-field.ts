import type { FieldTypes } from '@autoform/mui';
import type { MovieTimeListPageOptions, MovieTimeListPageOptionsWithSummary, MovieTimePageOptions } from '../utils/sync-options';
import { buildZodFieldConfig } from '@autoform/react';
import { z } from 'zod';
import { UserOptions } from '../utils/sync-options';

const fieldConfig = buildZodFieldConfig<FieldTypes>();

type FieldConfig = Parameters<typeof fieldConfig>[0];

type Field<T> = FieldConfig & (T extends object ? {
  children?: FieldChildren<T>;
} : object);

type FieldChildren<T> = { [K in keyof T]?: Field<T[K]> };

const movieTimePageOptionsFieldChildren: FieldChildren<MovieTimePageOptions> = {
  enabled: {
    label: '有効',
  },
};

type AnchorDestinationOptions = {
  anchorDestination: string;
};

const createMovieTimeListPageOptionsFieldChildren = (
  { anchorDestination }: AnchorDestinationOptions,
): FieldChildren<MovieTimeListPageOptions> => ({
  ...movieTimePageOptionsFieldChildren,
  anchorSelectors: {
    label: '[Advanced] アンカーセレクター',
    description: `${anchorDestination}へのURLを持つ<a>へのCSSセレクター。空に設定すると既定値を使用。`,
  },
  parentRelativeSelectors: {
    label: '[Advanced] 親要素相対セレクター',
    description: '動画時間表示の親要素への<a>からの相対CSSセレクター。空に設定すると既定値を使用。',
  },
});

const createMovieTimeListPageOptionsWithSummaryFieldChildren = (
  options: AnchorDestinationOptions,
): FieldChildren<MovieTimeListPageOptionsWithSummary> => ({
  ...createMovieTimeListPageOptionsFieldChildren(options),
  summaryParentSelectors: {
    label: '[Advanced] 合計親要素セレクター',
    description: '取得した全チャプター合計動画時間表示の親要素。空に設定すると既定値を使用。',
  },
});

const userOptionsField: Field<UserOptions> = {
  children: {
    movieTime: {
      label: '動画合計時間表示',
      children: {
        timeout: {
          label: '要素取得タイムアウト',
          description: '動画時間表示の親要素を検索する最長時間。単位は [ms]。',
        },
        pages: {
          label: 'ページ',
          children: {
            course: {
              label: 'コースページ',
              children: createMovieTimeListPageOptionsWithSummaryFieldChildren({
                anchorDestination: 'チャプターページ',
              }),
            },
            chapter: {
              label: 'チャプターページ',
              children: {
                ...movieTimePageOptionsFieldChildren,
                parentSelectors: {
                  label: '[Advanced] 親要素セレクター',
                  description: '動画時間表示の親要素へのCSSセレクター。空に設定すると既定値を使用。',
                },
                expanderSelectors: {
                  label: '[Advanced] エキスパンダーセレクター',
                  description: '教材モーダルを開く/閉じるボタンへのCSSセレクター。空に設定すると既定値を使用。',
                },
              },
            },
            myCourse: {
              label: 'マイコースページ',
              description: '大量の通信が必要なため、常時有効にするのは推奨されない。',
              children: createMovieTimeListPageOptionsFieldChildren({
                anchorDestination: 'コースページ',
              }),
            },
            myCourseReport: {
              label: 'マイコースページ - レポート',
              description: '大量の通信が必要なため、常時有効にするのは推奨されない。',
              children: createMovieTimeListPageOptionsFieldChildren({
                anchorDestination: '月間レポートページ',
              }),
            },
            monthlyReports: {
              label: '月間レポートページ',
              children: createMovieTimeListPageOptionsWithSummaryFieldChildren({
                anchorDestination: 'チャプターページ',
              }),
            },
          },
        },
      },
    },
    wordCount: {
      label: '単語数表示',
      children: {
        enabled: {
          label: '有効',
        },
        timeout: {
          label: '要素取得タイムアウト',
          description: '単語数表示の親要素を検索する最長時間。単位は [ms]。',
        },
        fieldSelectors: {
          label: '[Advanced] フィールドセレクター',
          description: 'カウントする<input>や<textarea>への、セクションフレーム内ドキュメントからのCSSセレクター。空に設定すると既定値を使用。',
        },
        counterSelectors: {
          label: '[Advanced] カウンターセレクター',
          description: '単語数表示の親要素への、カウントする<input>や<textarea>の親要素からの相対CSSセレクター。空に設定すると既定値を使用。',
        },
      },
    },
  },
};

const applyField = <T>(
  schema: z.ZodType<T>,
  field: Field<T>,
): z.ZodEffects<z.ZodType<T>> => {
  const { children, ...config } = { children: undefined, ...field };

  let targetSchema: z.ZodType<T>;

  if (schema instanceof z.ZodObject && children) {
    const newShape = Object.fromEntries(
      Object.entries((schema as z.SomeZodObject).shape).map(([key, childSchema]) => {
        const childField = (children as NonNullable<FieldChildren<Record<string, unknown>>>)[key];
        return [key, childField ? applyField(childSchema, childField) : childSchema];
      }),
    );

    targetSchema = new z.ZodObject({
      ...schema._def,
      shape: () => newShape,
    });
  } else if (schema instanceof z.ZodNumber) {
    targetSchema = new z.ZodNumber({
      ...schema._def,
      coerce: true,
    }) as any;
  } else {
    targetSchema = schema;
  }

  return targetSchema.superRefine(fieldConfig(config));
};

const UserOptionsWithField = applyField(UserOptions, userOptionsField) as z.ZodEffects<typeof UserOptions>;

export default UserOptionsWithField;
