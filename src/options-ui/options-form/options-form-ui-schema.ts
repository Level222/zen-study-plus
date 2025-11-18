import type { UiSchemaContent, UiSchemaRef, UiSchemaRoot } from '@sjsf/form';
import type { OmitIndexSignature } from 'type-fest';
import type { KeyboardShortcutItemOptions, MovieTimeListPageOptions, MovieTimeListPageOptionsWithSummary, MovieTimePageOptions, UserOptions } from '../../utils/sync-options';

type OptionsFormUiSchema<T>
  = & (UiSchemaContent | UiSchemaRef)
    & (T extends object ? { [K in keyof T]: OptionsFormUiSchema<T[K]> } : unknown);

type OptionsFormUiSchemaRoot
  = & OptionsFormUiSchema<UserOptions>
    & OmitIndexSignature<UiSchemaRoot>;

const movieTimePageOptionsUiSchema: OptionsFormUiSchema<MovieTimePageOptions> = {
  enabled: {
    'ui:options': {
      title: '有効',
    },
  },
};

type AnchorDestinationOptions = {
  anchorDestination: string;
};

const createMovieTimeListPageOptionsUiSchema = (
  { anchorDestination }: AnchorDestinationOptions,
): OptionsFormUiSchema<MovieTimeListPageOptions> => ({
  ...movieTimePageOptionsUiSchema,
  anchorSelectors: {
    'ui:options': {
      title: '[Advanced] アンカーセレクター',
      description: `${anchorDestination}へのURLを持つ<a>へのCSSセレクター。空に設定すると既定値を使用。`,
    },
  },
  parentRelativeSelectors: {
    'ui:options': {
      title: '[Advanced] 親要素相対セレクター',
      description: '動画時間表示の親要素への<a>からの相対CSSセレクター。空に設定すると既定値を使用。',
    },
  },
});

const createMovieTimeListPageOptionsWithSummaryUiSchema = (
  options: AnchorDestinationOptions,
): OptionsFormUiSchema<MovieTimeListPageOptionsWithSummary> => ({
  ...createMovieTimeListPageOptionsUiSchema(options),
  summaryParentSelectors: {
    'ui:options': {
      title: '[Advanced] 合計親要素セレクター',
      description: '取得した全チャプター合計動画時間表示の親要素へのCSSセレクター。空に設定すると既定値を使用。',
    },
  },
});

const keyboardShortcutOptionsUiSchema: OptionsFormUiSchema<KeyboardShortcutItemOptions> = {
  patterns: {
    'ui:options': {
      title: 'キーパターン',
      description: '設定方法は下記用語解説を参照。空に設定すると無効になる。',
    },
  },
};

const optionsFormUiSchema: UiSchemaRoot = {
  'movieTime': {
    'ui:options': {
      title: '動画合計時間表示',
    },
    'pages': {
      'ui:options': {
        title: 'ページ',
      },
      'course': {
        ...createMovieTimeListPageOptionsWithSummaryUiSchema({
          anchorDestination: 'チャプターページ',
        }),
        'ui:options': {
          title: 'コースページ',
        },
      },
      'chapter': {
        ...movieTimePageOptionsUiSchema,
        'ui:options': {
          title: 'チャプターページ',
        },
        'parentSelectors': {
          'ui:options': {
            title: '[Advanced] 親要素セレクター',
            description: '動画時間表示の親要素へのCSSセレクター。空に設定すると既定値を使用。',
          },
        },
      },
      'myCourse': {
        ...createMovieTimeListPageOptionsUiSchema({
          anchorDestination: 'コースページ',
        }),
        'ui:options': {
          title: 'マイコースページ',
        },
      },
      'myCourseReport': {
        ...createMovieTimeListPageOptionsUiSchema({
          anchorDestination: '月間レポートページ',
        }),
        'ui:options': {
          title: 'マイコースページ - レポート',
        },
      },
      'monthlyReports': {
        ...createMovieTimeListPageOptionsWithSummaryUiSchema({
          anchorDestination: 'チャプターページ',
        }),
        'ui:options': {
          title: '月間レポートページ',
        },
      },
    },
    'myCourseSectionsWrapper': {
      'ui:options': {
        title: '[Advanced] マイコースセクションラッパーセレクター',
        description: '動画時間セクションを追加する、マイコースページ内の右側のセクションの親要素へのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
  },
  'wordCount': {
    'ui:options': {
      title: '単語数表示',
    },
    'enabled': {
      'ui:options': {
        title: '有効',
      },
    },
    'fieldSelectors': {
      'ui:options': {
        title: '[Advanced] フィールドセレクター',
        description: 'カウントする<input>や<textarea>への、セクションフレーム内ドキュメントからのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
    'counterSelectors': {
      'ui:options': {
        title: '[Advanced] カウンターセレクター',
        description: '単語数表示の親要素への、カウントする<input>や<textarea>の親要素からの相対CSSセレクター。空に設定すると既定値を使用。',
      },
    },
  },
  'keyboardShortcuts': {
    'ui:options': {
      title: 'キーボードショートカット',
    },
    'shortcuts': {
      'ui:options': {
        title: 'ショートカット',
      },
      'playOrPause': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '再生/一時停止',
        },
      },
      'seekBackward': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '巻き戻し',
        },
        'seconds': {
          'ui:options': {
            title: '秒数',
          },
        },
      },
      'seekForward': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '早送り',
        },
        'seconds': {
          'ui:options': {
            title: '秒数',
          },
        },
      },
      'mute': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: 'ミュート',
        },
      },
      'fullscreen': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '全画面表示',
        },
      },
      'pictureInPicture': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: 'ピクチャー・イン・ピクチャー',
        },
      },
      'theaterMode': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: 'シアターモード',
        },
      },
      'expandSection': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: 'セクションを拡大',
        },
      },
      'previousSection': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '前のセクション',
        },
      },
      'nextSection': {
        ...keyboardShortcutOptionsUiSchema,
        'ui:options': {
          title: '次のセクション',
        },
      },
    },
    'defaultShortcutsToDisable': {
      ...keyboardShortcutOptionsUiSchema,
      'ui:options': {
        title: '[Advanced] 無効にするデフォルトショートカット',
        description: '無効にしたい、拡張機能無しでZEN Studyにデフォルトで存在するショートカット。空に設定すると既定値を使用。',
      },
    },
    'ignoreTargetSelectors': {
      'ui:options': {
        title: '[Advanced] 無視するターゲットセレクター',
        description: 'ショートカットをトリガーしない要素へのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
    'videoShortcutTimeout': {
      'ui:options': {
        title: '動画ショートカットタイムアウト',
        description: '動画関連のショートカットで、動画がロードされるまでの最長待機時間。単位は [ms]。',
      },
    },
    'sectionVideoSelectors': {
      'ui:options': {
        title: '[Advanced] セクション動画セレクター',
        description: 'セクションページ内の動画要素へのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
    'theaterModeButtonSelectors': {
      'ui:options': {
        title: '[Advanced] シアターモードボタンセレクター',
        description: 'セクションページ内のシアターモード切り替えボタンへのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
    'expandButtonSelectors': {
      'ui:options': {
        title: '[Advanced] 拡大ボタンセレクター',
        description: 'チャプターページ内のセクション拡大・縮小ボタンへのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
    'sectionListItemSelectors': {
      'ui:options': {
        title: '[Advanced] セクションリストアイテムセレクター',
        description: 'チャプターページ内のセクションリストの各アイテムへのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
  },
  'disableMathJaxFocus': {
    'ui:options': {
      title: 'MathJaxのTabキーによるフォーカスの無効化',
    },
    'enabled': {
      'ui:options': {
        title: '有効',
        description: '有効から無効に変更した際はページの再読み込みが必要。',
      },
    },
    'mathJaxElementSelectors': {
      'ui:options': {
        title: '[Advanced] MathJax要素セレクター',
        description: 'MathJaxの出力された数式へのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
  },
  'referenceSizeAdjustment': {
    'ui:options': {
      title: '補助テキストのサイズ調整',
    },
    'enabled': {
      'ui:options': {
        title: '有効',
      },
    },
    'additionalHeight': {
      'ui:options': {
        title: '余分な高さ',
        description: '補助テキストに追加される余分な高さ。この値を大きくすることでスクロールバーを確実に表示させないようにできる可能性がある。単位は [px]。',
      },
    },
    'maxHeight': {
      'ui:options': {
        title: '最大高さ',
        description: '補助テキストの最大高さ。無限ループの回避に使われる。単位は [px]。',
      },
    },
    'referenceSelectors': {
      'ui:options': {
        title: '[Advanced] 補助テキストセレクター',
        description: 'セクションページ内の補助テキストへのCSSセレクター。空に設定すると既定値を使用。',
      },
    },
  },
  'disableStickyMovie': {
    'ui:options': {
      title: '動画の固定表示の無効化',
    },
    'enabled': {
      'ui:options': {
        title: '有効',
      },
    },
  },
} satisfies OptionsFormUiSchemaRoot;

export default optionsFormUiSchema;
