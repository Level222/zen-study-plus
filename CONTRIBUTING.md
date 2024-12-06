# 貢献方法

## 共通事項

- ドキュメントやIssues、プルリクエスト、コミットメッセージ、コメントは、基本的に英語または日本語を使用する。

## 問題を報告する・機能を提案する

[Issues](https://github.com/Level222/zen-study-plus/issues) から新しいIssueを作成する。報告する前に、同様の問題がすでに報告されていないか確認してください。

## 問題を修正する・機能を追加する

1. このリポジトリをフォークしてクローン、新しいブランチを作成

2. 依存関係をインストール

    ```shell
    npm i
    ```

3. コードに変更を加え、フォークしたリポジトリにプッシュする

    - [VSCode](https://code.visualstudio.com)に最適化 (リンターの設定、保存時の自動フォーマット等) されているため、VSCodeでの開発を推奨する

    - 開発サーバー

      ```shell
      npm run dev
      ```

    - 本番ビルド

      ```shell
      npm run build
      ```

    - [ESLint](https://eslint.org)と[Stylelint](https://stylelint.io)でlint、フォーマットを行う

      ```shell
      npm run lint          # ESLintでlint、フォーマットの問題を表示
      npm run lint:fix      # ESLintでlint、フォーマットを修正
      npm run stylelint     # Stylelintでlint、フォーマットの問題を表示
      npm run stylelint:fix # Stylelintでlint、フォーマットを修正
      ```

    - コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/)に従う

4. このリポジトリに新しいプルリクエストを作成
