# 居酒屋テトリス

現実の居酒屋で遊びながら使える、テトリス型パーティーゲーム補助アプリです。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## ビルド

```bash
npm run build
npm run start
```

Vercel では通常の Next.js プロジェクトとしてデプロイできます。

## 主な機能

- 通常テトリス
- ゲームオーバー盤面の保存
- 食った・飲んだストック管理
- メモ履歴
- 10枚カードデッキ
- エース、ジョーカー処理
- 候補ミノ除外
- 3秒削除タイマー
- 縦1列空きのクリア判定
- リザルト表示
- localStorage 保存
- Web App Manifest と Service Worker による簡易 PWA 対応
