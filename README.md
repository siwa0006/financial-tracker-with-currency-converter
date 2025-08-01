# 💰 MoneyMood - 支出は感情になる

「支出は感情になる」をコンセプトにした新感覚の支出管理アプリです。世界中どこで使っても自動で円換算され、支出が増えるたびにあなたの分身の人生が変わっていきます。

## ✨ 特徴

### 🎯 核心機能
- **多通貨リアルタイム換算機能**: 入力された通貨（USD, EUR, MYRなど）を入力時点の為替レートで自動的に日本円に換算
- **ライフシミュレーター**: 支出総額に応じてアニメーションで生活の様子が変化
- **支出入力UI**: 通貨選択、カテゴリ、メモ機能付き
- **履歴 & 可視化**: カレンダー表示、通貨別・カテゴリ別の支出グラフ

### 🏠 ライフステート
| 支出総額（円） | アニメーションの状態 | メッセージ例 |
|---------------|-------------------|-------------|
| 0〜49,999円 | 高級マンションで優雅な生活 | 「今日はカフェでくつろいだ☕️」 |
| 50,000〜79,999円 | ボロアパートで節約生活 | 「今日はインスタントラーメン🍜」 |
| 80,000〜99,999円 | 野宿・路上生活 | 「今夜は橋の下で眠ります...🥶」 |
| 100,000円〜 | 幽霊化（死亡） | 「金欠により現世との接続が切れました💸👻」 |

### 📊 追加機能
- **月別支出管理機能**: 月ごとに自動で分類し、月単位で総支出額やアニメーションの状態を管理
- **支出修正機能**: 簡単に編集・削除できる機能
- **ローカルストレージ**: データはブラウザに保存され、プライバシーを保護

## 🚀 セットアップ

### 必要条件
- Node.js (v16以上)
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd moneymood
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで `http://localhost:3000` を開く

### ビルド
```bash
npm run build
```

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **UIライブラリ**: Lucide React (アイコン)
- **為替レートAPI**: ExchangeRate-API
- **スタイリング**: CSS-in-JS (styled-components風)

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── LifeAnimation.tsx    # ライフステートアニメーション
│   ├── ExpenseForm.tsx      # 支出入力フォーム
│   └── ExpenseHistory.tsx   # 支出履歴
├── services/           # APIサービス
│   └── currencyApi.ts      # 為替レート取得
├── types/             # TypeScript型定義
│   └── index.ts
├── utils/             # ユーティリティ関数
│   └── lifeStateCalculator.ts
├── App.tsx           # メインアプリケーション
├── main.tsx          # エントリーポイント
└── index.css         # グローバルスタイル
```

## 🎨 デザイン

- **モダンなグラデーション背景**: 美しい紫から青へのグラデーション
- **ガラスモーフィズム**: 半透明の背景とブラー効果
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **アニメーション**: CSSアニメーションでライフステートを表現

## 🔧 カスタマイズ

### ライフステートの閾値を変更
`src/types/index.ts` の `LIFE_STATES` オブジェクトを編集してください。

### 新しいカテゴリを追加
`src/types/index.ts` の `EXPENSE_CATEGORIES` に新しいカテゴリを追加してください。

### 為替レートAPIの変更
`src/services/currencyApi.ts` の `API_BASE_URL` を変更してください。

## 📱 対応通貨

- JPY (日本円)
- USD (米ドル)
- EUR (ユーロ)
- GBP (イギリスポンド)
- CAD (カナダドル)
- AUD (オーストラリアドル)
- CHF (スイスフラン)
- CNY (中国人民元)
- KRW (韓国ウォン)
- SGD (シンガポールドル)
- HKD (香港ドル)
- MYR (マレーシアリンギット)
- THB (タイバーツ)
- IDR (インドネシアルピア)
- PHP (フィリピンペソ)
- VND (ベトナムドン)

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- [ExchangeRate-API](https://exchangerate-api.com/) - 為替レートデータ
- [Lucide](https://lucide.dev/) - 美しいアイコン
- [Vite](https://vitejs.dev/) - 高速なビルドツール

---

**MoneyMood** - 支出は感情になる 🎭 # financial-tracker-with-currency-converter-
