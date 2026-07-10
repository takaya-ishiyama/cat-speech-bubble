# Cat Speech Bubble

猫の写真を選ぶと、ランダムなセリフ入り吹き出しをブラウザ内で合成するWebアプリです。

## 特徴

- Canvas APIで画像処理をブラウザ内に限定
- 写真をサーバーへ送信しない
- DB・外部API不要
- JPEG / PNG / WebP対応
- セリフと吹き出し位置をランダム生成
- セリフの再抽選とPNG保存
- ドラッグ＆ドロップ対応
- Cloudflare Workers Static Assetsへデプロイ可能

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## Cloudflare Workersへデプロイ

```bash
npx wrangler login
npm run deploy
```

Cloudflare DashboardからGitHub連携する場合、デプロイコマンドは `npm run deploy` を指定します。

`wrangler.jsonc` のWorker名は `cat-speech-bubble` です。すでに同名のWorkerがある場合は変更してください。
