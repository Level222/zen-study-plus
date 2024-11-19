export type Term = {
  name: string;
  description: string;
};

export type TermSection = {
  name: string;
  terms: Term[];
};

const termSections: TermSection[] = [
  {
    name: 'オプションの表記',
    terms: [
      {
        name: '[Advanced]',
        description: '通常変更する必要のない、高度なオプション。',
      },
    ],
  },
  {
    name: '全般',
    terms: [
      {
        name: 'コース',
        description: '複数のチャプターをもつグループ。',
      },
      {
        name: 'チャプター',
        description: '複数の教材をもつグループ。',
      },
      {
        name: '教材',
        description: '動画や問題など、個々のリソース。',
      },
      {
        name: '学園',
        description: '学校法人角川ドワンゴ学園（N・ S・R高等学校やN中等部）、学校法人日本財団ドワンゴ学園（ZEN大学）など、ZEN Studyを導入している学校。基本的にZEN Studyを必修授業として使用している学校のみを指す。',
      },
      {
        name: 'レポート',
        description: '学園での必修授業。',
      },
    ],
  },
  {
    name: 'ページ',
    terms: [
      {
        name: 'コースページ',
        description: '各コースページ。チャプターが一覧表示される。URLは https://www.nnn.ed.nico/courses/* という形式。',
      },
      {
        name: 'チャプターページ',
        description: '各チャプターページ。動画の視聴や問題の解答を行う。URLは https://www.nnn.ed.nico/courses/*/chapters/* という形式。',
      },
      {
        name: 'マイコースページ',
        description: '受講しているコースが一覧表示される。URLは https://www.nnn.ed.nico/my_course。',
      },
      {
        name: '月間レポートページ',
        description: '各月間レポートページ。その月間のレポートが一覧表示される。URLは https://www.nnn.ed.nico/study_plans/month/* という形式。',
      },
    ],
  },
  {
    name: 'ページ内の部品',
    terms: [
      {
        name: '教材モーダル',
        description: 'チャプターページ中で教材を選択したら出てくる教材。',
      },
    ],
  },
  {
    name: 'ウェブ技術',
    terms: [
      {
        name: '要素',
        description: 'HTML要素のこと。ページを構成する基本的な部品。',
      },
      {
        name: 'CSSセレクター',
        description: 'ページ中の要素を選択するパターン。詳しくはご自身でご確認ください。',
      },
    ],
  },
];

export default termSections;
