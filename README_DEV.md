## 環境構築手順 (開発者用)

1. 各ソフトをインストールする<br>
・Postman<br>
・Docker Desktop

2. ビルド込みで初回起動<br>
`docker compose -f docker-compose.yaml up -d --build`

3. Laravelの初回セットアップ<br>
各コマンドをルートパスで実行する<br>
`docker compose exec php composer install`<br>
`docker compose exec php cp .env.example .env`<br>
`docker compose exec php php artisan key:generate`<br>
`docker compose exec php php artisan migrate`

4. 動作確認<br>
フロント:<br>
下記コマンドを順に実行したのち
`cd frontend`<br>
`npm run dev`<br>
http://localhost:5173 を開くことができればOK<br><br>
API:<br>
Postmanでhttp://localhost:8080/api/health を叩き、レスポンス "ok": trueと表示されればOK

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
