# APP-004 M6｜iPhone Safari実操作検収・本番非更新プロトコル

## 開始条件
- 正本: https://github.com/yama-books/reverse-planner
- 対象コード: M5 Draft PR #9 のコミット `df0e33a9eaf447b4b96c3a253e7604eade6149ca`。
- M6証跡: [Draft PR #10](https://github.com/yama-books/reverse-planner/pull/10)。`feature/m6-iphone-live-preview-20261022` はM5をbaseとし、本番配信を行わない。
- 公式GitHub Pages（公開済みv0.1相当）: https://yama-books.github.io/reverse-planner/ 。**最新版M5ではない。**
- 外部HTMLプロキシ方式（非公式・要検証）: `https://raw.githack.com/yama-books/reverse-planner/df0e33a9eaf447b4b96c3a253e7604eade6149ca/index.html`。
- 上記外部URLが**実際にアプリとして動作する**と案内できるのは[M6の実ネットワークCI](https://github.com/yama-books/reverse-planner/actions/workflows/m6-external-preview.yml)がSUCCESSになった場合のみ。HTMLの200だけでは不十分。
- 外部プロキシはGitHubの公式製品ではなく、データ保持・第三者の稼働・キャッシュ・セキュリティを保証しない。**正式公開URLとして配布しない**。HTTP上で公開済みソースが中継されることと、リポジトリ/PAGESの更新を区別する。

## プライバシー・共有オリジンへの注意
**外部プロキシ上のJavaScriptとlocalStorageは、他のGitHubプロジェクトも同じオリジン（raw.githack.com）を使い得るため、サイトごとに厳密に隔離されるとは限らない。** したがってここでは架空データ専用とする。

- iPhone Safariの「プライベートブラウズ」で開く。
- 本名、学校/児童生徒情報、実際の予定や期限、パスワード、個人の位置・住所等を入力しない。
- 「家事A」「10分」、架空の期限などダミーデータで動作確認する。
- テスト後はプライベートタブを閉じる。ブラウザ共有オリジンのデータ保護目的で第三者URLを正式なサービスとして再利用しない。
- iPhoneにインストールしてホーム画面に常設しない。プロキシURLは非公式で、長期の安定配信を保証しない。

## 実機検収（要ユーザー操作）
1. M6外部URLの成功ステータスと、HTML/JS/CSS/PNGのContent-TypeおよびWebKitの画面操作テストに成功していることをGitHub Actionsで照合する。
2. SafariプライベートモードでM5対象URLを開き、HOMEのネコと時刻/日付カードを確認する。画像の下端や白枠、横スクロールを記録する。
3. SETUPでプリセットを押し、4画像が日本語ラベルと整列すること、ラベルと押せる範囲、入力欄・詳細設定・日時ピッカー・日本語IMEを確認する。
4. PLANで開始時刻/不足警告/ネコを確認する。
5. RUNでタイマー操作、DONEでネコの切替と「全部できた！」表示を確認する。
6. ブラウザのアドレスバー上下変化、縦横画面回転、文字サイズ拡大・VoiceOver、閉じる→再読込の操作を試す。必要なら機能別に短い画面録画/スクリーンショットを残す。
7. 画像が壊れた場合でも記号が表示されるかはCIと条件付きで比較する。Safariで無理にネットワーク遮断を再現しなくてよい。
8. 結果を `画面 | iOS/Safari機種 | 操作 | OK/NG | スクリーンショット | 再現手順` に記録する。

## 終了・採否基準
- **M6外部URLがCIで失敗**: ユーザーに未検証リンクを「動作可能」と案内しない。原因を明示し、非公式プロキシを採用せず公式Pagesと別のプレビュー配信方法を検討する。
- **M6外部URLがCIで成功**: 公開ページを変更せず実機テストを開始できる。ただし実機Safariで動いたとはまだ言えない。
- 素材の正式採用と、iPhone Safari操作成功は別の判断。mainマージ・Pages公開・既存プレビューの正式版への統合・リポジトリ作成はこのM6段階で実施しない。

## M6動作確認結果（2026-10-22 JST）

- [HTTP/MIME gate #39772841553](https://github.com/yama-books/reverse-planner/actions/runs/39772841553)：**SUCCESS**。HTML、JavaScript Modules、CSS、PNGの7ファイルをHTTP 200 / 意図したContent-Typeで取得。
- [外部Chromeスモーク #39773898685](https://github.com/yama-books/reverse-planner/actions/runs/39773898685)：**SUCCESS**。第三者サービスの最初の警告画面 `External Content Notice` で `Open the page` を押すとM5をロードできた。HOME、時刻選択→SETUP、修正版exam画像128px描画、テスト勉強プリセット（架空3タスク）→PLAN画面を実ネットワークから確認。JSアプリ例外・重大リソースHTTPエラー0。
- このURLは外部サービスの確認画面を経由する。初期のHTMLがHTTP200でも実アプリHTMLでないことを検出して、現在は確認画面を通過する流れも含めて検査済み。
- GitHub公式PagesやM5のソースは公開し直していない。CIは `contents:read` 権限で外部GETのみ。今後のiPhone Safari実機検収は別途。

**iPhoneでの試験手順**: Safariプライベートタブで [M5固定版](https://raw.githack.com/yama-books/reverse-planner/df0e33a9eaf447b4b96c3a253e7604eade6149ca/index.html) →「Open the page」→仮データのみでHOME/SETUP/PLAN/RUN/DONEを操作→タブを閉じる。

共有ドメインのため、他サービスのコンテンツによる同一オリジンlocalStorageアクセスに注意。学生情報・実住所・実際の予定を使用しない。確認画面の運営元や第三者スクリプトの安全性はアプリのテスト成否によって保証されない。
