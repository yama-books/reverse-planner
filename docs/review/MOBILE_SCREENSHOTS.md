# APP-004｜スマホから直接見る画面キャプチャ

**スクショの正本**：公開された専用ブランチ [preview/app004-mobile](https://github.com/yama-books/reverse-planner/tree/preview/app004-mobile/docs/review/screenshots)。

**このブランチは実装用 main / v0.2 PR #1 / ロゴPR #3 とは別管理**。本番Pagesの公開内容は変更しない。

## スマホから開く

| 画面 | 390px 相当 | その他 |
| --- | --- | --- |
| HOME | [PNGを開く](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/home-390.png) | [文字200%相当](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/home-text200-390.png) |
| SETUP | [PNGを開く](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/setup-mobile.png) | [文字200%相当・320px](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/setup-text200-320.png) |
| PLAN | [PNGを開く](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/clock-plan-mobile.png) | [文字200%相当・320px](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/plan-text200-320.png) |
| RUN | [PNGを開く](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/timer-mobile.png) | [文字200%相当・320px](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/run-text200-320.png) |
| DONE | [PNGを開く](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile/docs/review/screenshots/done-mobile.png) | 実画面上の作業完了直後 |

## 更新方法

- `tests/browser-smoke.mjs` のChromiumブラウザ検証がサンプルデータからPNGを作る。
- PR #3を更新してCI成功すると、`.github/workflows/deploy-pages.yml` 内の `mobile-review` が検品用PNGだけを `preview/app004-mobile` に自動保存する。対象PRが同一Repoの特定作業ブランチであることを検証し、専用の書き込み権限で実行する。**CIが失敗した場合は旧検証済みスクショを保持する。**
- テスト画像はアプリ本番の素材とは別。採用画像「猫と彩る8ビット風リバースプランナー.png」ではない。実機iPhone Safariの描画確認とも混同しない。
- 次セッションでも可能な限りZIPのダウンロード先だけで終わらず、直接開けるPNGと、可能なら会話内プレビューを案内する。
- 計画名・期日などはテスト用の架空データだけを使う。利用者の実データや非公開セッション情報はスクショ公開対象に含めない。

## 注意

公開されるスクショはスマホ**幅を模擬したChromium**の画像。iPhone実機でのタッチ、保存、画面スクロール、VoiceOver、WebKit等の確認は別のゲートで行う。
