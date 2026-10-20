# HANDOFF_READY｜APP-004 Reverse Planner 素材保全

**区切り：2026-10-20 JST／以後のアップロード・変更を停止**

## 作業の識別・正本
- APP-ID: `APP-004`
- 領域：Reverse Planner / UI素材の原本保管・移管（M0）
- 正本Repo: https://github.com/yama-books/reverse-planner
- 主作業branch: `feature/asset-archive-20261019`
- 新HANDOFF作成直前の確認済みHEAD: `8137d4f4ffd6ba285c2b45d4a21e4517dec68455`
- 正式な `work_id`: この作業中には確認できていないため**未登録／未確認**
- main: `0e6ef171a0c601893a909d7967accfaf0c475b24`（公開中v0.1、変更なし）
- 既存Draft PR: [#1 UI v0.2](https://github.com/yama-books/reverse-planner/pull/1)、[#2 アイコンQC](https://github.com/yama-books/reverse-planner/pull/2)、[#3 ブランド統合](https://github.com/yama-books/reverse-planner/pull/3)、[#4 M0回収ビューア](https://github.com/yama-books/reverse-planner/pull/4)
- 素材ブランチはこれらとは別。**本番へマージ・Pages公開・ロゴ採用・画面実装を行っていない**。

## GitHubで保存を確認できた素材

`assets/source-archive/` 以下に、以下のファイルと復元情報が存在する。

| アーカイブ | 保存形態 | 合計サイズ | 記録済み原本SHA-256 |
|---|---|---:|---|
| HQ-v5 厳選ネコ12点 | `cats/hq-v5/cats-hq-v5.zip.part001`〜`004` | 3,584,000 bytes | `8360b3598a2fef2d491ed1e6c7778b1d3e3de91b8dd14ffd5c4e78c3553d1a45` |
| QC-v4 196アイコン＋元シート12枚 | `icons/qc-v4/icons-qc-v4-196.zip.part001`〜`017` | 35,306,466 bytes | `f1b6c92264914de53b5755a0b356b1a4840b4c7492cd41869e3cb15cc37b24a2` |
| 文字ロゴA比較v1 | `brand/logo-A-v1/reverse_planner_logo_A_comparison_v1.zip` | 2,012,955 bytes | `81ef4b68def47b0af5d181b80f358412608045564313147ef9d789034998a84d` |

- 上記の保存パス・分割数・サイズは**今回GitHubツリーから読戻して確認**。`assets/source-archive/README.md` に合計サイズ、ハッシュ、素材の目的、復元コマンドが登録済み。
- `assets/recover_source_archives.py` もGitHubで**ソース存在を確認**。結合時に原本SHA-256と長さを検査し、既存ファイルへの上書きを拒否する設計。
- 以前のセッションで各元ZIPについて破損検査成功の報告あり。元ZIPの内訳はネコ80ファイル、アイコン435ファイル（**以前の434との報告を訂正**）、ロゴ17ファイル。
- ブランド参考画像6ファイルも `assets/source-archive/brand/` に確認：ネコ付きロゴのJPEG、A2候補PNG、A比較ZIP、文字ロゴ比較スクショ、Dコンパクト比較スクショ、ロゴコンセプトボードJPEG。
- `docs/icons/M0_RECOVERED_BLOB_MANIFEST.csv` はPR #4系の回収記録、`docs/icons/SCREEN_ASSET_INTEGRATION_PLAN_V01.md` は配置計画。以前の11個の未参照Git blobを今から再利用する必要はない。

## 検証範囲・未検証を区別

**確認済み**：
1. Archive作業branch HEADとmain HEAD（2026-10-20、GitHub GET）。
2. 保存済みの分割ZIP 4片＋17片、文字ロゴZIP、ブランド画像6件のGitHubツリー上の存在とサイズ。
3. READMEと復元スクリプトのGitHubテキスト読戻し。
4. 前段作業でネコ5点を画像として目視、PR #4回収ビューアはモバイル幅Chromiumで11/11表示成功という記録がある。

**この区切りでは未実施**：
- GitHub上の分割片を現在の端末で実際に結合し、SHA-256を再計算した独立検証（READMEに記録済みのチェック値を今回再読した段階）。復元CLIの実行ログ採取も未実施。
- 196候補すべてのUI検品・透過品質判定と、アイコン単体PNGの本採用。
- 正式ロゴの承認ゲートON、採用決定。ネコ付きの提供JPEGとA系文字ロゴ比較は**保管済み候補**であり、勝手に合成・置換しない。
- HOME / SETUP / PLAN / RUN / RUN内完了状態へのネコ5点実装（M1）、UI操作アイコンの統合（M2）。
- 実機iPhone Safari、CIの新規成功確認、PRレビュー・マージ、Pages再公開。
- PDF/画像/ZIP一式をUIに埋め込んだり、mainへ36MB級アーカイブを移したりすること。

## 過去のCHECKPOINTの扱い
`docs/checkpoints/APP004_ASSET_ARCHIVE_STOP_20261019.md` はその時点の正しい記録だが、そこには「196アイコンZIPは未保存」とある。**これは現在の状態ではない**。当HANDOFFと `assets/source-archive/README.md` の新しいGitHubツリーを優先し、旧作業を繰り返さない。

## 次の1操作（ユーザーが再開を指示した後）

**最初にGitHubの最新HEADを照合し、`python assets/recover_source_archives.py --archive cats` および `--archive icons` に相当するSHA-256検証ログを取得する。** 現在のブランチに既に21片あるため、分割ファイルの再アップロードはしない。検証に成功したら、HQネコ5点だけの軽量なM1用ドラフトPRで実画面に配置し、ZIPを本体に同梱しない。スマホから直接開けるPNGキャプチャを添え、既存の計算・保存データ互換のテストを通す。本番公開や正式ロゴの採用は別途判断する。

## セッション終了規則
当HANDOFFの保存・読戻しが確認できた時点で区切りとし、以降のアップロード、コミット、PR作成、CI再実行、公開は**次のセッションへ引き継ぐ**。
