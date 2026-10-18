# APP-004｜正式ロゴ組込み仕様と受入ゲート（2026-10-18）

状態：**受入原画像待ち。表示スロット・フォールバックのみ実装済み。** 本ドキュメントは採用済みデザインを作り直す指示ではない。

## 採用基準と素材の出所

- 最終採用：「猫と彩る8ビット風リバースプランナー.png」。文字は `Reverse Planner` / `ギャクサンプランナー`、深い青緑、ミント、クリーム、茶白ネコ、時計、カレンダー、小旗、山、木、星。文字の基準は旧A2、装飾・構成は最終採用画像を優先。
- 最終画像の**実体はGitHubにも本作業環境にも未取得**。ユーザーから正本画像を受領するまで類似画像を作らない。文字の再組版・小文字「ャ」・半濁点「プ」・長音「ー」・「ン」の点検は受領後。
- 旧A2（文字比較）資料は `LOGO_A_COMPARISON_V1.md`。以前のSVG/PNG本体は会話ZIPにのみ記録されておりGitHubにはない。
- ネコ196素材の登録台帳・厳選12の選抜はDraft PR #2に記録。画像バイナリは別ZIPで、実ファイル未保管。PR #2は無条件にマージしない。

## ファイル契約（実体を確認してから追加）

| ファイル | 用途 | 条件 |
| --- | --- | --- |
| `assets/brand/reference-original.png` | 採用画像の非破壊保存 | 入手・出所・公開可否確認後 |
| `assets/brand/logo-horizontal.svg` | HOMEの正式横長ロゴ | 文字を正しいテキストから組み直し、編集可能要素と非編集ラスタを区別 |
| `assets/brand/logo-horizontal.png` | 横長の透過ラスター | 実機で透明縁・文字・色を検品 |
| `assets/brand/logo-compact.svg` | ヘッダー/SETUP/PLAN/RUN | 320pxと200%拡大で読めること |
| `assets/brand/logo-compact.png` | SVG非対応時の参照/配布用 | 不透明な背景の混入を検査 |
| `assets/brand/cat-done.png` | 完了時の小演出 | 出所は厳選12点の採用後、モーション抑制あり |
| `assets/brand/app-icon-512.png` | 正方形アイコン基準 | 文字を小さく詰め込まず視認性優先 |
| `assets/brand/apple-touch-icon.png` | iOSホーム画面 180px | 透明部分のiOS描画を確認 |
| `assets/brand/favicon-32.png` | favicon | 16/32pxで確認 |

SVGに画像を一枚埋め込んだだけのものを編集可能ベクターとは呼ばない。使用フォントのOFL等の配布条件を確認する。フォントを不用意に同梱しない。

## 非破壊の組込み

- `index.html`：6スロット（header/HOME/SETUP/PLAN/RUN/DONE）。旧ヘッダーワードマークは `brand-header-fallback` として保持。
- `assets/brand/brand.mjs`：**approved: false**の間は画像をロードせずDOMを書き換えない。ロゴ画像が正常ロードできた場合だけ旧ワードマークを隠す。ロード失敗時はフォールバックを維持。
- `assets/app.css`：320pxを含む縮小表示、SVGの自然比、ラスタPNGはピクセル表示、完了演出、Reduced Motionを既存ルールに従わせる。
- `assets/app.js`・`assets/core.mjs`・`assets/state.mjs`：**変更しない**。逆算計算・日時入力・タスク編集・タイマー・localStorage形式を維持する。
- 受入PNG/SVGを正本に保存したあと、参照パスを照合して `BRAND_ASSETS.approved` をtrueに変更する。欠品状態のまま有効化しない。

## 完了条件と検証区分

1. 原画像受領・原本ハッシュ/出所確認・文字単位検品・色とキャラクター照合。
2. 編集可能SVG／アウトライン版、透過PNG、コンパクト版、favicon、touch iconの生成・寸法/透明縁/日本語確認。
3. HOME→SETUP→PLAN→RUN、完了、時間・日付両ルート、旧v0.1保存4シート、破損保存データ保護、タイマー、計画出力。
4. Chromium 320/390/1280px、横はみ出し0、200%文字拡大、Tab操作、Reduced Motion（動画的装飾は任意）。テストログと画面キャプチャを残す。
5. GitHub Actionsの単体・ブラウザテスト成功（WebKit/iPhone Safari実機と混同しない）。
6. iPhone SafariのレビューURLを独立ホスティングで提供し、本人によるタップ・保存・画面スクロール・ホーム画面アイコン確認を記録。**mainのPagesを予告なしで上書きしない**。
7. 差分確認・PRレビューの後に本番へ反映を判断する。CI成功、公開、実機検証を別々の証跡とする。

## 現在のブロッカー

- 正式採用画像および高品質ネコPNGの実体が未取得。
- ロゴ画像表示・200%拡大・Safari操作は今回まだ未検証。
- このブランチはPR #1を基点とする独立差分。PR #2とは画像原本の取得方法が決まるまで分離する。
- 登録済み `work_id` は今回の公開台帳では確認できないため空欄扱い。
