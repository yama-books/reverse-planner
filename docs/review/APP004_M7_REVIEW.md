# APP-004 M7｜iPhone所見のUI修正

M6 `2d5b657ee8cd362693c5761d38f28fdca68413f4` を土台にした独立Draft。
main / 本番Pages / 既存PRの先端は変更しない。保存形式・計算エンジン・ネコ原画像を維持。

## 所見への対応

| 所見 | 対応 | 検証・限界 |
| --- | --- | --- |
| 同じサンプルで確認が出る | 作業名・時間・順序・未完了状態を比較。同一内容なら確認・再生成を省略。異なるモードの同一内容へ移る場合はモードだけ切替 | 再押下・再読込・編集後・別サンプル・キャンセルを両ブラウザで検証。差分なしの保存状態を完全一致で確認 |
| 適用中が不明 | 一致時のみ「適用中」と aria-pressed。名前/時間/完了/追加/削除/並べ替え時も再判定 | 適用中は保存しないため、編集後に古い表示を残さない |
| 詳細設定が間延び | summaryの上下9px、最小48px。スマホ用.panelの18px余白をdetailsへ重ねない | 320/390/428px、折りたたみ・展開を確認 |
| 残り3時間が曖昧 | 小ラベル「やること」と太字の値「残り3時間」。作業日/予備日も2層化 | 日付・時刻の両モードと文字拡大で確認 |
| 再生アイコン下切れ | 元PNG自体の下端欠けを確認。imagegenで下端を補修した別候補play.pngを128pxへ縮小。専用36px枠・中央揃え・明示line-height | 元review-v2は保持。透過余白とCTA内の収まり、画像失敗時の記号復帰を確認。候補のデザイン採否はレビュー対象 |
| 編集矢印 | 既存の配色に合わせた小さな透過SVGを追加。表示文言と記号フォールバックを維持 | 装飾画像。読み上げはボタン文言、画像は操作を受け取らない |
| サンプル画像が小さい | 24→32px。タップ領域44px以上を維持 | 320pxでも4個のラベルと適用中表示が折り返して収まる |
| 下端・はみだし | safe-area左右とフッター下端を加算、100svh対応。CTA内折返し・狭いtimeline/run行を調整。overflowを隠して誤魔化さない | 通常幅3種・文字拡大近似・高さ560pxで確認。物理iPhoneのsafe-area値、URLバー、native confirm自体の描画は未検証 |

## アイコン棚卸し

| 場所 | 今回 | 優先度・判断 |
| --- | --- | --- |
| プリセット4種 | 既存透過PNGを32pxに拡大 | 対応済み |
| 今日の分を見る | 下端補修候補＋表示枠 | 高・対応済み |
| やることを直す | 透過SVG＋読込失敗時記号 | 高・対応済み |
| 追加 / 詳しく設定 | 既存透過PNGを再利用 | 対応済み、今回は余白のみ調整 |
| セクション見出し | 番号とチェックを維持 | 低・順序や意味が明確。装飾追加を保留 |
| 上下移動 / 削除 | ↑↓×、44px、個別aria-labelを維持 | 中・密な操作列の即読性を優先して保留 |
| JSON保存 | ↓とテキストを維持 | 低・補助操作。独立したダウンロード素材が整った時に再検討 |
| 予定をつくる / 戻る / 保存した計画 | 既存記号とラベルを維持 | 中〜低・主要2CTAを先行し全操作の一括画像化は行わない |

## 検証とスクリーンショット

Windowsローカル実測（2026-10-23 JST）: Node 24件、Chromium既存104件、M4 WebKit60件、M5 Chromium/WebKit各74件、M7 Chromium/WebKit各53件が成功、JS例外0。
M7は320/390/428pxのHOME/SETUP/PLAN/RUN、詳細展開、下端、PLAN文字拡大近似、画像欠損を保存。
beforeはM6固定コミットをHTTP配信して同じテストデータで撮影。beforeのRUNは通常文字、afterのRUNは文字拡大後の検証画像。

PNGは[レビュー専用ブランチ](https://github.com/yama-books/reverse-planner/tree/preview/app004-mobile-m7/docs/review/screenshots/m7)へ保存。

- [変更前SETUP320](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/before/setup-320.png) / [変更後SETUP320](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/after/setup-320.png)
- [変更前PLAN320](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/before/plan-320.png) / [変更後PLAN320](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/after/plan-320.png)
- [390px下端](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/after/bottom-390.png) / [428pxPLAN](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-m7/docs/review/screenshots/m7/webkit/after/plan-428.png)

CIは`.github/workflows/m7-iphone-ui.yml`。contents:readとartifact保存のみで、Pages配信処理はない。
既存テストサーバーのパス境界をOS依存の`/`から`path.sep`に修正し、Windows上でも同じ検証を実行可能にした。
M5のラベル採取とChromiumの再生画像参照は新UIに合わせて更新し、検査内容は維持。

未確認: 物理iPhone Safari / VoiceOver / iOS Dynamic Type / 実際のsafe-area / Safari標準confirmの見た目。自動試験は標準confirmの発火・accept/dismissと保存結果を検証する。
Jev監査はローカル差分の送信許可待ち。常設allowlistを変更せず、未許可の素材は送信しない。

## 補修候補の由来

- 入力: assets/icons/ui/review-v2/RP-TIMER-S04-I01.png（旧素材を保持）。
- imagegen編集: 緑・クリームの再生意匠を保ち、欠けた下端を閉じ、四辺へ透過余白を設ける指示。出力はreview-m7/play.pngにのみ追加。
- review-m7/edit-arrow.svg: 自作の戻る矢印。既存mint/ink配色、透過背景、32px viewBox。
- ロールバック: M7 PRを取り込まない、またはM7コミットをrevert。保存データの移行は不要。
