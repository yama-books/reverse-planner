# APP-004 M4｜WebKit擬似iPhone表示のレビュー

画面はGitHub Actions上のLinux版Playwright WebKitによる撮影です。
iPhone13相当viewport/touch設定を使いますが、**Apple iPhoneの実機Safariで検証したものではありません**。
元データはテスト用の仮予定のみ。アプリ本番公開、mainマージ、採用決定は未実施です。

- HOME: home-320.png, home-390.png, home-428.png
- SETUP: setup-320.png, setup-390.png, setup-added-320.png, setup-added-390.png
- PLAN: plan-320.png, plan-390.png
- RUN: run-320.png, run-390.png
- DONE: done-320.png, done-390.png
- TEXT: home-large-text-320.png (CSS font-size拡大による近似、iOS Dynamic Typeではない)
- 画像欠損: missing-icon-fallback-390.png
- ウィンドウ幅・cat/icon表示・画像のボタン内収まり・対象buttonの高さ: webkit-report.json

ブラウザ描画の目視比較後にデザイン採否を判断してください。

## 最新WebKit結果（2026-10-22 JST）
- [GitHub Actions #39688072722](https://github.com/yama-books/reverse-planner/actions/runs/39688072722): **SUCCESS**、Node23/23、WebKit **60件成功**、PNG **14枚**、JavaScript例外0。
- 検査対象の320/390/428pxで横スクロールなし、SETUPの時間チップ/テンプレート/並べ替えと削除に44pxのタップ領域を確認。
- DONE画面では「おつかれさま。／全部できた！」表示に切替。後戻りしてRUNへ戻る場合は通常見出しに復帰。
- スマホ版Safari実機の確認と画像正式承認は未実施。
