# Travel Plan Portal

> 個人開発中の旅行プラン作成アプリです。
> Laravel API と React SPA を分離し、認証、旅行プラン一覧・詳細参照、Docker 環境、CI までを整備しています。
> 転職活動向けに、実装だけでなく要件定義から環境構築まで一貫して取り組んだことが伝わる README として整理しました。

## このリポジトリで見てほしいポイント
- Laravel + React の分離構成で、Sanctum / CORS / CSRF を考慮した Cookie 認証を実装していること
- 旅行プラン一覧 API で、ページング・都道府県集約・費用集計をサーバーサイドで返却していること
- Docker / GitHub Actions / Pint / PHPStan / ESLint / Vitest を入れ、継続開発しやすい基盤を用意していること
- 実装前に要件定義資料を作成し、画面・機能・導線を整理してから開発に入っていること

## アプリ概要
旅行計画は、日程、移動、費用、訪問スポットの情報が分散しやすく、全体像を掴みにくいと感じることが多いです。
Travel Plan Portalは、そうした旅行計画の情報をひとつにまとめ、日ごとの流れを見やすく管理できるようにすることを目指した Web アプリです。

現時点では、以下を実装しています。
- 認証機能
- 認証状態の復元
- 旅行プラン一覧 API
- 旅行プラン詳細 API
- LP / 認証画面 / マイプラン画面のベース UI

AI による旅程提案や共有機能は構想済みで、今後拡張予定です。

## 実装済み機能
- [x] 新規登録
- [x] ログイン / ログアウト
- [x] 認証状態取得 (`/api/me`)
- [x] 旅行プラン一覧取得 (`/api/plans`)
- [x] 旅行プラン詳細取得 (`/api/plans/{uuid}`)
- [x] テスト用 Seed データ投入
- [x] Docker を使ったローカル開発環境
- [x] GitHub Actions による CI
- [ ] 旅行プラン作成 UI
- [ ] 旅行プラン編集 UI
- [ ] AI による旅程提案
- [ ] プラン共有機能

## 実装の工夫
- `frontend/src/lib/api.js`
  CSRF Cookie の取得を 1 回に集約し、419 エラー時のみ再取得して再試行するようにしています。
- `app/Http/Controllers/TravelPlan.php`
  DB の生データをそのまま返すのではなく、都道府県名・旅程終了日・総費用を UI で扱いやすい形に整形しています。
- `frontend/src/routes/auth.jsx`
  認証済み / 未認証で画面遷移を制御し、ログイン前後の導線が破綻しないようにしています。

## 主な API
| Method | Path | 説明 | 認証 |
| --- | --- | --- | --- |
| `POST` | `/api/register` | ユーザー新規登録 | 不要 |
| `POST` | `/api/login` | ログイン | 不要 |
| `POST` | `/api/logout` | ログアウト | 必要 |
| `GET` | `/api/me` | ログインユーザー情報取得 | 任意 |
| `GET` | `/api/plans` | 旅行プラン一覧取得 | 必要 |
| `GET` | `/api/plans/{uuid}` | 旅行プラン詳細取得 | 必要 |

## 技術スタック
| 分類 | 技術 | バージョン |
| --- | --- | --- |
| Backend | PHP | `8.3` |
| Backend | Laravel | `12` |
| Backend | Laravel Sanctum | `4` |
| Frontend | Node.js | `24` |
| Frontend | React | `19.2.4` |
| Frontend | React Router DOM | `7.13.1` |
| Frontend | Vite | `8.0.0` |
| Frontend | Tailwind CSS | `4.2.1` |
| Database | MySQL | `8.4` |
| Cache / Queue | Redis | `7-alpine` |
| Web Server | Nginx | `1.27-alpine` |
| Test | PHPUnit | `11.5.50` |
| Test | Vitest | `4.1.0` |
| Quality | Laravel Pint | `1.29` |
| Quality | Larastan | `3.9` |
| Quality | ESLint | `9.39.4` |
| Quality | Prettier | `3.8.1` |
| CI | GitHub Actions | `CI workflow` |

## 要件定義について
実装に入る前に、Confluence 上で要件定義資料を作成し、画面導線・必要機能・扱うデータを整理しました。
単にコードを書くのではなく、「誰のどんな課題を、どの画面と API で解決するか」を先に言語化してから開発を進めています。

- [要件定義資料（Confluence）](https://seyouk.atlassian.net/wiki/x/BYAB)

この資料作成を通じて、以下の観点を意識していました。

- ユーザーがどの順番で画面を使うか
- どの情報を一覧で見せ、どの情報を詳細で見せるか
- API が返すべきデータ粒度は何か
- 作成途中でも段階的に価値を出せる実装順になっているか

※ Confluence 側の閲覧権限が必要な場合があります。

## 今後の予定
- 旅行プランの作成 / 編集 UI 実装
- AI を使った旅程提案機能
- プラン共有機能
- フロントエンドのコンポーネントテスト拡充
- バックエンドのFeature Test等テスト拡充

## 補足
開発者向けの詳細なセットアップや補足コマンドは [README_DEV.md](./README_DEV.md) にまとめています。
