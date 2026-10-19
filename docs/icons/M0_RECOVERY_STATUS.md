# APP-004｜アイコン素材の復元状況（M0）

更新：2026-10-19 JST ／ **回収・閲覧は一部解決、通常PNGファイルとしてのGitHub保存は未完了**

## 保存済み・確認済み

- v6ネコチャン配置HTMLに12種類のPNGデータがID対応で存在する。12点とも256×256px、8bit RGBA、PNGチャンクCRCが正常。
- 11点分のGit blob SHAを `docs/icons/M0_RECOVERED_BLOB_MANIFEST.csv` に記録。全11点のGitオブジェクトが作成され、独立したtree `2d83f9a746d0b7ba88c45a4b037c4f649caa739f` に保存されている。
- **Gitオブジェクトはまだコミットに参照されていない**。通常のPNGファイルとしてブランチに登録できたことを意味しない。GitHub上で未参照データは将来保持を保証できないため、早期の確実な保全が必要。
- 読み取り専用のスマホ対応回収ビューア `docs/review/CAT_V6_RECOVERY_VIEWER.html` を作成・GitHubコミット保存した。
- 2026-10-19 に実ブラウザのモバイルモードでビューアを検証。11/11点の画像読込に成功、11/11点で「PNGを保存」リンクが表示された。HTTP/CORSエラーは0件。出所はGitHubの公開 `GET /repos/yama-books/reverse-planner/git/blobs/{sha}` API。
- ビューア参照先：`https://raw.githack.com/yama-books/reverse-planner/feature/icon-m0-recovery-20261018/docs/review/CAT_V6_RECOVERY_VIEWER.html`。初回は外部プロキシの確認画面が出る。機密情報は入力させない。
- 今回の成果は **Draft PR #4** `https://github.com/yama-books/reverse-planner/pull/4` に隔離。PR #4はPR #3に積み重ねたレビュー専用。main / PR #1 / PR #2 / PR #3は変更していない。

## 未完了

- `RP-CATVAR-S11-I47`（ねむいネコ）のGit blob作成はツールの安全性チェックによって拒否。再送・迂回せず保留。
- 11点の通常PNGファイルとしてのコミットは、画像treeへの低レベルcommit作成が安全性チェックで拒否されたため未完了。承認は受領したが、ツール側の拒否を回避しない。
- 原製作ZIPとのバイト同一性、すべての画像の目視検品、iPhone Safari実機の保存、静的ホスティングでの永続性、アプリ実装、正式ロゴ、CI、公開判定は未完了。
- 回収ビューアはブラウザ動作確認済みだが、PNG保存リンクを実際にクリックしてファイルへ保存した検証は未実施。

## 次の1操作

GitHubへの通常PNGファイル保管が認められる適切な操作環境・権限を確保する。必要ならユーザーがビューアで11点をダウンロードしてWorkモードのクラウドブラウザ等へ渡せる。**原素材の再生成や、拒否された処理の迂回はしない。** ファイル保存を読戻し確認してから、5点の実画面統合（M1）に進む。
