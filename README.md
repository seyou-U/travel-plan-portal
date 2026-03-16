# 開発者用
## 環境構築手順

1. 各ソフトをインストールする
・Postman
・Docker Desktop

2. ビルド込みで初回起動
`docker compose -f docker-compose.yaml up -d --build`

3. Laravelの初回セットアップ
各コマンドをルートパスで実行する
`docker compose exec php composer install`
`docker compose exec php cp .env.example .env`
`docker compose exec php php artisan key:generate`
`docker compose exec php php artisan migrate`

4. 動作確認
フロント:
http://localhost:5173 を開くことができればOK

API:
Postmanでhttp://localhost:8080/api/health を叩き、レスポンス "ok": trueと表示されればOK

## 備考
CIにて設定されているが、ローカル環境動作用に各コマンドについて下記にまとめる

・PHP Unit test
docker compose exec php php artisan test

・Laravelのフォーマッタ
docker compose exec php ./vendor/bin/pint

・Laravelの静的解析(Larastan)
docker compose exec php ./vendor/bin/phpstan analyse -c phpstan.neon

・React Unitテスト(Vitest)
docker compose exec web sh -lc "cd /app && npm run test:run"

・Reactのリンター(ESLint)
docker compose exec web sh -lc "cd /app && npm run lint"

