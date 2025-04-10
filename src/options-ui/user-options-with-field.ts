import type { FieldTypes } from '@autoform/mui';
import type { SuperRefinement } from 'zod';
import type { KeyboardShortcutOptions, MovieTimeListPageOptions, MovieTimeListPageOptionsWithSummary, MovieTimePageOptions } from '../utils/sync-options';
import { buildZodFieldConfig } from '@autoform/react';
import { z } from 'zod';
import { parsePatterns } from '../utils/shortcut-keys';
import { UserOptions } from '../utils/sync-options';

const fieldConfig = buildZodFieldConfig<FieldTypes>();

type FieldConfig = Parameters<typeof fieldConfig>[0];

type Field<T> =
  & FieldConfig
  & {
    superRefinement?: SuperRefinement<T>;
  }
  & (T extends object ? { children: FieldChildren<T> } : object);

type FieldChildren<T> = { [K in keyof T]-?: Field<T[K]> };

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

const keyboardShortcutOptionsFieldChildren: FieldChildren<KeyboardShortcutOptions> = {
  patterns: {
    label: 'キーパターン',
    description: '設定方法は下記用語解説を参照。空に設定すると無効になる。',
    superRefinement: (patterns, ctx) => {
      if (patterns) {
        try {
          parsePatterns(patterns);
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },
  },
};

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
              children: createMovieTimeListPageOptionsFieldChildren({
                anchorDestination: 'コースページ',
              }),
            },
            myCourseReport: {
              label: 'マイコースページ - レポート',
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
        myCourseSectionsWrapper: {
          label: '[Advanced] マイコースセクションラッパーセレクター',
          description: '動画時間セクションを追加する、マイコースページ内の右側のセクションの親要素へのCSSセレクター。空に設定すると既定値を使用。',
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
    keyboardShortcuts: {
      label: 'キーボードショートカット',
      children: {
        shortcuts: {
          label: 'ショートカット',
          children: {
            playOrPause: {
              label: '再生/一時停止',
              children: keyboardShortcutOptionsFieldChildren,
            },
            seekBackward: {
              label: '巻き戻し',
              children: {
                ...keyboardShortcutOptionsFieldChildren,
                seconds: {
                  label: '秒数',
                },
              },
            },
            seekForward: {
              label: '早送り',
              children: {
                ...keyboardShortcutOptionsFieldChildren,
                seconds: {
                  label: '秒数',
                },
              },
            },
            mute: {
              label: 'ミュート',
              children: keyboardShortcutOptionsFieldChildren,
            },
            fullscreen: {
              label: '全画面表示',
              children: keyboardShortcutOptionsFieldChildren,
            },
            pictureInPicture: {
              label: 'ピクチャー・イン・ピクチャー',
              children: keyboardShortcutOptionsFieldChildren,
            },
            previousSection: {
              label: '前のセクション',
              children: keyboardShortcutOptionsFieldChildren,
            },
            nextSection: {
              label: '次のセクション',
              children: keyboardShortcutOptionsFieldChildren,
            },
          },
        },
        defaultShortcutsToDisable: {
          label: '[Advanced] 無効にするデフォルトショートカット',
          description: '無効にしたい、拡張機能無しでZEN Studyにデフォルトで存在するショートカット。空に設定すると既定値を使用。',
          children: keyboardShortcutOptionsFieldChildren,
        },
        ignoreTargetSelectors: {
          label: '[Advanced] 無視するターゲットセレクター',
          description: 'ショートカットをトリガーしない要素へのCSSセレクター。空に設定すると既定値を使用。',
        },
      },
    },
    disableMathJaxFocus: {
      label: 'MathJaxのTabキーによるフォーカスの無効化',
      children: {
        enabled: {
          label: '有効',
          description: '有効から無効に変更した際はページの再読み込みが必要。',
        },
        mathJaxElementSelectors: {
          label: '[Advanced] MathJax要素セレクター',
          description: 'MathJaxの出力された数式へのCSSセレクター。空に設定すると既定値を使用。',
        },
      },
    },
    pageComponents: {
      label: 'ページ内部品',
      children: {
        sectionVideoSelectors: {
          label: '[Advanced] セクション動画セレクター',
          description: 'セクションページ内の動画要素へのCSSセレクター。空に設定すると既定値を使用。',
        },
        chapterSectionListItemsSelectors: {
          label: '[Advanced] チャプターセクションリストアイテムセレクター',
          description: 'チャプターページ内のセクションリストの各アイテムへのCSSセレクター。空に設定すると既定値を使用。',
        },
      },
    },
  },
};

const applyField = <T>(
  schema: z.ZodType<T>,
  field: Field<T>,
): z.ZodEffects<z.ZodType<T>> => {
  const { superRefinement, children, ...config } = { children: undefined, ...field };

  let currentSchema: z.ZodType<T> = schema;

  if (superRefinement) {
    currentSchema = schema.superRefine(superRefinement);
  }

  if (currentSchema instanceof z.ZodObject && children) {
    const currentShape = (currentSchema as z.SomeZodObject).shape;

    const newShape = Object.fromEntries(
      Object.entries(children).map(([key, childField]) => {
        const childSchema = currentShape[key];
        return [key, childField ? applyField(childSchema, childField) : childSchema];
      }),
    );

    currentSchema = new z.ZodObject({
      ...currentSchema._def,
      shape: () => newShape,
    });
  } else if (currentSchema instanceof z.ZodNumber) {
    currentSchema = new z.ZodNumber({
      ...currentSchema._def,
      coerce: true,
    }) as any;
  }

  return currentSchema.superRefine(fieldConfig(config));
};

const UserOptionsWithField = applyField(UserOptions, userOptionsField) as z.ZodEffects<typeof UserOptions>;

export default UserOptionsWithField;
