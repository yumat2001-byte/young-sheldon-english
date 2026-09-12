# Young Sheldon English v3.32

第2話をHOMEから選択して学習できます。80語をCORE 40・PLUS 20・EXTRA 20に分け、10語ずつの8セットにしています。和訳、発音表記、関連語、フレーズ、独自の例文、読み上げ、通常テスト、苦手テストを利用できます。

- 第1話の保存キー `ys-state` は維持。第2話は `ys-state-s01e02` に保存します。
- 第2話の語彙は公開エピソードテキストで登場を照合しました。活用形の照合結果は `data/episode-2-verification.json` にあります。
- 第2話の例文と訳は独自作成です。本編のセリフやその逐語訳ではありません。学習画面にも区別を表示しています。
- 未公開だったv3.31の変更（今日の10語の非表示、独立した苦手テスト、重複しない通常テスト）を含みます。
- 苦手テストでは正解した語を苦手から外し、0語でCLEARを表示します。
- 通常テストは苦手 → うろ覚え → 未学習 → ほぼ覚えた → 覚えたの順に出題。選択肢は同じ品詞グループで構成します。

## 更新方法

`data/episode-2.tsv` を編集し、`python3 scripts/build-episode-2.py` を実行すると、第2話データとページ、v3.32の入口を生成します。第1話の入口は `index.html`、共通の話数切り替えは `episode-ui.js` です。

## 検証

Playwrightを利用して `node scripts/verify-episodes.mjs` を実行します。ローカルHTTPサーバーの既定URLは `http://127.0.0.1:4175/` です。`BASE_URL`、`PLAYWRIGHT_MODULE`、`CHROME_PATH` で上書きできます。

確認済み: 第1話の保存記録の保持、第2話の保存と再読み込み、8セット、80語の品詞に合った4択、CORE/ALL、通常テストの優先順・重複排除、誤答後の正答による苦手解消、CLEAR、SET学習からテスト完了、単語一覧からの学習、スマートフォンとデスクトップ表示、v3.32の入口、JavaScriptとHTTPのエラーなし。

出典: https://www.springfieldspringfield.co.uk/view_episode_scripts.php?episode=s01e02&tv-show=young-sheldon-2017
