## 環境構築手順 (開発者用)

事前に以下をインストールしてください。

- Docker Desktop

初回セットアップは以下の手順です。

1. 環境変数ファイルを作成
`cp .env.example .env`

2. Docker コンテナを起動
`docker compose up -d --build`

3. PHP 依存関係をインストール
`docker compose exec php composer install`

4. Laravel のアプリキーを生成
`docker compose exec php php artisan key:generate`

5. マイグレーションと Seeder を実行
`docker compose exec php php artisan migrate --seed`

Seeder ではテストユーザーと旅行プランのサンプルデータを投入します。
- テストユーザー: `test@example.com`
- パスワード: `password`

6. 動作確認
- Frontend: `http://localhost:5173`
- API Base URL: `http://localhost:8080`

必要に応じて、Postman などから `POST /api/login` や `GET /api/plans` を確認してください。

## 備考
CIにて設定されているが、ローカル環境動作用に各コマンドについて下記にまとめる<br>

・PHP Unit test<br>
`docker compose exec php php artisan test`

・Laravelのフォーマッタ<br>
`docker compose exec php ./vendor/bin/pint`

・Laravelの静的解析(Larastan)<br>
`docker compose exec php ./vendor/bin/phpstan analyse -c phpstan.neon`

・React Unitテスト(Vitest)<br>
`cd frontend`<br>
`npm run test:run`

・Reactのフォーマッタ<br>
`cd frontend`<br>
`npm run format`

・Reactのリンター(ESLint)<br>
`cd frontend`<br>
`npm run lint`
