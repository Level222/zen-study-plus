import type { ReactNode } from 'react';
import ExternalLink from '../components/ExternalLink';

export type Term = {
  name: string;
  description: ReactNode;
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
      {
        name: '既定値',
        description: (
          <>
            全オプションの既定値と、「空に設定すると既定値を使用」の既定値は
            {' '}
            <ExternalLink href="https://github.com/Level222/zen-study-plus/blob/main/src/utils/default-options.ts" />
            {' '}
            から閲覧可能。
          </>
        ),
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
        description: '複数のセクションをもつグループ。',
      },
      {
        name: 'セクション',
        description: '動画や問題など、個々の教材。',
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
        description: (
          <>
            受講しているコースが一覧表示される。URLは
            {' '}
            <ExternalLink href="https://www.nnn.ed.nico/my_course" />
            。
          </>
        ),
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
        description: 'チャプターページ中でセクションを選択したら出てくる教材。',
      },
      {
        name: 'セクションフレーム',
        description: '教材モーダル中の、セクションページが埋め込まれているフレーム要素。',
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
      {
        name: 'MathJax',
        description: '数式を表示するためのエンジン。',
      },
    ],
  },
  {
    name: 'キーボードショートカット',
    terms: [
      {
        name: 'キーパターン',
        description: 'キーボードショートカットを実行するキーの組み合わせ。"+" で複数のキーをつなぐ。"," で複数のパターンを定義した場合、それらのいずれかがトリガーした際に実行される。空白にスペースを使用可能。',
      },
      {
        name: 'キー',
        description: 'トリガーキーまたは修飾キー。',
      },
      {
        name: 'トリガーキー',
        description: (
          <>
            修飾キー以外のキー。各パターンに一つしか含むことができない。基本的にキーコードの値を使用する。ただし、アルファベットはAからZ（必ず大文字）、数字は0から9（これは数字キーとテンキー両方をサポートする）を使用する。 キーコードの値のうち、Backquote, Backslash, BracketLeft, BracketRight, Comma, Equal, IntlBackslash, IntlRo, IntlYen, Minus, Period, Quote, Semicolon, Slash, Enter, Space, Tab, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, End, Home, PageDown, PageUp, Escape, F1からF24 をサポート。高度な機能として、code:Delete のような文法でサポートされていないキーコード、key:Escape のような文法で物理キーに依存しない値（
            <ExternalLink href="https://www.w3.org/TR/uievents-key/" />
            ）を利用可能。
          </>
        ),
      },
      {
        name: 'キーコード',
        description: (
          <>
            キーボードの物理キーの位置を表すコード。ユーザーのレイアウトを無視し、例えばJIS配列（日本語配列、106配列）のキーボードで "@" を押した場合、コードはUS配列（101配列）の位置である "Backspace" となる。
            キーコードを確認する場合、
            <ExternalLink href="https://w3c.github.io/uievents/tools/key-event-viewer.html" />
            {' '}
            を参照し、入力フィールドに任意のキーを入力する。表の UI Events
            {' > '}
            code がキーコードの値である。
            <ExternalLink href="https://www.w3.org/TR/uievents-code/" />
            {' '}
            からキーコードについて詳しく知ることができる。
          </>
        ),
      },
      {
        name: '修飾キー',
        description: 'Shift, Alt, Ctrl, MacCtrl, MacCommand の5種類と、特別な役割をもつ Any がある。修飾キーはパターンに含まれなくてもよい。重複を含むことはできない。Any を含めた場合、定義した修飾キー以外の修飾キーが押されていても実行される。MacのOptionは Alt で定義する。Macで、"Ctrl+A" は "MacCtrl+A,MacCommand+A" と同義である。',
      },
    ],
  },
];

export default termSections;
