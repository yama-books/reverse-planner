# APP-004 M5｜絵文字UI画像置換レビュー

2026-10-22 JST。M4 Draft PR #8の先に積むM5レビュー候補。正式採用・mainマージ・Pages更新・本番公開は行わない。

## 置換対象の棚卸し

| 場所 | 元の記号 | 今回の対応 |
|---|---|---|
| SETUPプリセット（時刻・日付、くらし・まなび） | ☕ 家事・支度 | マグカップ `assets/icons/presets/review-v1/home-prep.png` |
| 同上 | ✿ おでかけ | 外出バッグ `assets/icons/presets/review-v1/outing.png` |
| 同上 | ✎ 宿題 | ノートと鉛筆 `assets/icons/presets/review-v1/homework.png` |
| 同上 | ▦ テスト勉強 | 問題集 `assets/icons/presets/review-v1/exam.png` |
| HOME見出し・大きな装飾・プライバシー文、RUN小見出し、完了PLAN、DONE、フッター | ✳ / ✦ / ★ | 共通きらめき `assets/icons/decor/review-v1/sparkle.png` |
| ヘッダーの既存ブランド文字 | ★ | 保留。既存ブランドフォールバックと正式ロゴ承認の範囲を維持 |
| HOME保存済み計画のカテゴリ | ✎ / ⌂ | 保留。今回はプリセットと装飾を優先。意味ラベルは残る |
| 並べ替え、削除、戻る、開始、完了、状態など | ↑ ↓ × ＋ ▶ ✓ ← → ↗ ↶ ⌄ ● ※ | 保留。操作記号・状態テキストを維持。M2の置換済み画像は継続利用 |
| タイムライン、数値、句読点、CSSによる図形 | 通常の文字・CSS | 対象外。読みやすさと機能を優先 |

## 実装・素材

- 画像はすべて `review-v1/` の候補。採用済み素材用のディレクトリは増やしていない。M3/M4の保存済みネコ・UI画像は再生成・再アップロード・上書きしていない。
- 4プリセットは24px表示。装飾は周囲の文字サイズに追従。ピクセル表示、暗い輪郭、クリーム・ミント・ピーチ・黄土色。
- 既存M2の `mountOptionalActionIcons` をスコープ指定で再利用。動的に再作成されるプリセット・完了表示にも明示的に取り付ける。
- 読み込み成功時のみ画像表示。初回欠損・読み込み後のエラー時は元記号を復帰。画像と記号のグループは `aria-hidden="true"`、画像は `alt=""`。隣接する日本語ラベルは常に残る。
- 画像は `pointer-events:none`。既存ボタン全体をタップ対象とし、4プリセットの最小高さ44px。M4の編集・並べ替え・削除領域を維持。
- 保存形式・予定計算・プリセットのタスクデータは変更していない。
- 320pxのChromiumでは19pxの画面スライドが14pxの余白を超え、viewportが5px拡張される場合を検出。移動を8pxへ縮小し、動きを減らす設定ではスライドを省略。通常動作と縮小動作の両方で実幅を検査する。
- M4検証の操作アイコン測定は `.m2-icon` を明示し、ボタン外のM5装飾を誤って操作アイコンとして測らない。M5側で新画像の読み込み・収まり・代替表示を検査する。

## 生成記録

組み込みImageGenを使用（CLI/APIへの切替なし）。元出力は生成画像フォルダに保持し、アルファ領域をトリミングして104px以内へ最近傍縮小、128px透明キャンバス中央へ配置した派生候補だけをこのRepoに保存。

4プリセット共通プロンプト：

> Use case: stylized-concept. Asset type: tiny pixel art UI icon for a Japanese gentle reverse planner. Create one centered [subject]. Square image, genuinely transparent background, no background tile, no letters or text, no shadows outside object, no watermark. Simple readable silhouette, generous transparent margin around edges, chunky 8-bit pixel art, dark teal outlines (#173e43), soft cream (#f6f2e8), mint (#8bbfa7), warm peach and muted ochre. Match the attached conversation's existing small clock icon style: cozy soft pixels, restrained shading. Must remain clearly recognizable at 24px display; no tiny decoration. This is the [name] preset icon. Only one object composition.

| name | subject | 元出力ファイル名 |
|---|---|---|
| home-prep | a warm peach ceramic mug with a small handle | exec-7fe3825a-7f09-4f9b-88a5-5c746a7efc54.png |
| outing | a mint-green small shoulder bag for going out | exec-b5813193-7bc3-4622-bb0c-cd9c4aa0ecbe.png |
| homework | a yellow pencil diagonally across a cream notebook | exec-1c3d50d2-cec1-4ba0-97f8-b4ca1a7a6c6b.png |
| exam | a closed mint-green study book with a simple grid on its cover | exec-2a8e057f-5507-4b17-a529-0c5c1b2c4399.png |

きらめきプロンプト：

> Create one small centered four-point sparkle UI icon, chunky 8-bit pixel art, dark teal outline #173e43, warm muted gold fill, cream highlight. Cozy gentle Japanese planner style matching mint and cream cat pixel illustrations. A single readable sparkle silhouette only, no text, no surrounding dots, no tile or white background, no shadow. Genuinely transparent PNG background. Generous transparent margin. Must remain legible at 16px. Square composition.

元出力：`exec-f4ae651c-5cef-4050-8bae-0f36b3933968.png`。共通の元出力フォルダ：`D:/codex_home/generated_images/01a161dd-d664-7750-b5b8-1986deb5e433/`。ローカル参照記録であり元データの再アップロードは行わない。

## スマホ確認用PNG

隔離先：`preview/app004-m5-images`。以下はWebKitのPNGへ直接リンクする。Chromiumの同名PNGも保存。

- [プリセット変更前後](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/preset-before-after.png)
- [320px SETUP](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/setup-320.png)
- [320px タスク追加後](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/setup-added-320.png)
- [320px DONE](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/done-320.png)
- [背景別・16/24/32px比較](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/background-size-comparison.png)
- [320px 画像失敗時SETUP](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/fallback-setup-320.png)
- [320px 画像失敗時DONE](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/fallback-done-320.png)
- [320px プリセット文字2倍](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-m5-images/docs/review/screenshots/m5/webkit/setup-large-text-320.png)
- [測定JSONと全PNG](https://github.com/yama-books/reverse-planner/tree/preview/app004-m5-images/docs/review/screenshots/m5)

## 検証方法・残件

- Node既存テスト：`node --test tests/*.test.mjs`
- PNGの実アルファ：`python tests/m5-alpha.py`
- Chromium：`node tests/m5-image-review.mjs`
- WebKit：`M5_BROWSER=webkit node tests/m5-image-review.mjs`（POSIX表記。PowerShellでは環境変数を設定）
- GitHub Actionsでは既存 `browser-smoke.mjs` とM4 WebKit検証も実行し、成功後だけPNG/JSONを専用previewブランチへ保存する。Pagesやデプロイの呼出しはない。
- 320/390/428pxのHOME・SETUP・追加後SETUP・PLAN・RUN・DONE、4プリセットの時刻/日付の適用、再描画、保存からDONE復帰、完了PLAN、画像成功後のエラーと再読込回復、初回画像遮断、ラベルと代替記号、プリセット文字2倍を検証。
- 実行結果と監査結果はM5 CHECKPOINTに記録。実行前の計画を成功証拠として扱わない。
- 未確認：物理iPhone Safari、VoiceOverによる実際の読み上げ、iOS Dynamic Type、OS日時入力、safe-area/URLバー変化、ブランド正式採用とライセンス最終決定。CSS文字拡大とWebKitはこれらの実機検査の代用とはしない。

## 最終結果（2026-10-22 JST）

**M5レビュー可能**。M4の先に積む [Draft PR #9](https://github.com/yama-books/reverse-planner/pull/9) を維持。

[CI #39750721243](https://github.com/yama-books/reverse-planner/actions/runs/39750721243) が成功：Node23/23、透過5点、既存Chromium104項目、M4 WebKit60項目、M5 Chromium/WebKit各72項目、JS例外0。M5画像54枚と測定JSONを `preview/app004-m5-images` に保存済み。必須7種類の直接PNGリンクはHTTP200 / image/pngで確認済み。

最新PNGはLinux CI撮影。先に保存したWindows版の実行履歴は `local-environment.json` に残る。いずれも実機iPhone Safariではない。

Jev完了監査は実測ログ・必要な差分で計14件verified、矛盾・根拠不足・要レビュー0、provider=typesafe。mainとM4の先端、M3画像、保存データと計算、Pages workflowは維持。未確認事項と正式承認の保留は上記のとおり。
