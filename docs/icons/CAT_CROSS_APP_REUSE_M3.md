# APP-004｜ネコ画像の他アプリ再利用URL（M3候補）

**確認日：2026-10-21 JST／原本と修正版はどちらも未承認素材。**

作業Repo: https://github.com/yama-books/reverse-planner

- 以下URLは公開GitHubの**コミット固定**のPNG画像。HTMLの `<img src="...">` 等から直接参照可能。
- 既存M1のHQ-v5版は再加工しない保存済み原本。
- M3のreview-v2版は、元の作画シートから下端余裕を再考し、透過背景と余白を生成した**レビュー候補**。原本とは別パスで保持。
- raw.githubusercontent.com はアプリ用の恒久保証付き画像CDNではない。長期運用ならアプリ自身のassetsへ複製するか、将来の承認済み共通素材Repo/Releaseに固定する。
- ファイル再配布・商用許諾・ライセンスの対外公表は別途決定。現段階でCC0やMIT等の利用権を推定しない。
- 保存済みHQ-v5 12件の残り7件は分割ZIPの中で保全。下表の5件と違い、直接リンクできる独立PNGとしては未展開。

| ID/用途 | HQ-v5 PNG（原本） | M3 crop-safe PNG（確認用修正版） |
| --- | --- | --- |
| `RP-CATWORK-S09-I01` PC計画 / HOME | [256px原本](https://raw.githubusercontent.com/yama-books/reverse-planner/68d0791c8dab7ed0bd64f5773aa9e1b78e2dac86/assets/icons/cats/RP-CATWORK-S09-I01.png) | [256px修正版候補](https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATWORK-S09-I01.png) |
| `RP-CATWORK-S09-I03` メモ / SETUP | [256px原本](https://raw.githubusercontent.com/yama-books/reverse-planner/68d0791c8dab7ed0bd64f5773aa9e1b78e2dac86/assets/icons/cats/RP-CATWORK-S09-I03.png) | [256px修正版候補](https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATWORK-S09-I03.png) |
| `RP-CATEMO-S10-I07` 旗 / PLAN | [256px原本](https://raw.githubusercontent.com/yama-books/reverse-planner/68d0791c8dab7ed0bd64f5773aa9e1b78e2dac86/assets/icons/cats/RP-CATEMO-S10-I07.png) | [256px修正版候補](https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATEMO-S10-I07.png) |
| `RP-CATVAR-S11-I28` タイマー / RUN | [256px原本](https://raw.githubusercontent.com/yama-books/reverse-planner/68d0791c8dab7ed0bd64f5773aa9e1b78e2dac86/assets/icons/cats/RP-CATVAR-S11-I28.png) | [256px修正版候補](https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATVAR-S11-I28.png) |
| `RP-CATEMO-S10-I01` よろこぶ / DONE | [256px原本](https://raw.githubusercontent.com/yama-books/reverse-planner/68d0791c8dab7ed0bd64f5773aa9e1b78e2dac86/assets/icons/cats/RP-CATEMO-S10-I01.png) | [256px修正版候補](https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATEMO-S10-I01.png) |

[旧版と修正版の画質比較](https://raw.githubusercontent.com/yama-books/reverse-planner/preview/app004-mobile-icons-m3/docs/review/screenshots/m3/m3-before-after.png)・[アプリ実画面](https://github.com/yama-books/reverse-planner/tree/preview/app004-mobile-icons-m3/docs/review/screenshots/m3)

## 利用上の区別

アプリの正式なロゴやブランドキャラクターとして本採用したことはない。ほかのアプリで試用・比較する素材リンクを提供するものであり、利用条件と正式採用は別途確認する。

他アプリで使う例：

```html
<img src="https://raw.githubusercontent.com/yama-books/reverse-planner/61607b8d87331cafb8ced9497fd17eb910ee7e56/assets/icons/cats/review-v2/RP-CATEMO-S10-I01.png"
     width="96" height="96" alt="">
```

他のアプリへのURL共有ではGitHubアカウントトークンを含める必要はない。公式本番配信時は元アセットを所定のパブリック配信先に複製し、削除やbranch変更に依存しない構成を推奨する。
