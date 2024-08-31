## badges

[![Docker Image CI](https://github.com/Delta-Time/Akashi/actions/workflows/docker-image.yml/badge.svg?branch=master)](https://github.com/Delta-Time/Akashi/actions/workflows/docker-image.yml)

## API Document

- docker-compose の swagger-ui を上げる: `docker compose up swagger-ui`
- ブラウザアクセス: http://localhost:3939/

- （プロジェクトルートにあるopenapi.json見てもいいけど人間の読むものじゃない感）

## image

プライベート:
https://github.com/users/Delta-Time/packages/container/package/akashi-auth

## Commands

### `bun run migrate`
マイグレーション実行

### `bun run makeuser`
ユーザー作成

### `bun run keymake`
秘密鍵作成またはローテーション

## .env
```
POSTGRES_USER=hnufew
POSTGRES_PASSWORD=Rzc5S9ZHSZbxxaJzEWLyYJHRarJRRqRiWZj6FyzP
POSTGRES_DB=akashi

JWT_VERSION=1
```
