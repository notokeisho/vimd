# トラブルシューティング

よくある問題とその解決策です。

## pandoc が見つからない

### 症状

```
Error: pandoc not found
```

### 解決策

1. パッケージマネージャーを使用して pandoc をインストールします。

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt install pandoc

# Windows
choco install pandoc
```

2. インストールを確認します。

```bash
pandoc --version
```

3. ターミナルを再起動します

### それでも動作しない場合

- pandoc が PATH に含まれているか確認
- `which pandoc` (macOS/Linux) または `where pandoc` (Windows) を実行
- pandoc を再インストール

## ポートが使用中

### 症状

```
Error: EADDRINUSE: address already in use :::38080
```

### 解決策

#### オプション 1: vimd kill を使用（推奨）

v0.2.1 以降では、`vimd kill` コマンドで実行中のセッションを終了できます。

```bash
# 全セッションを終了
vimd kill

# 特定ポートのセッションを終了
vimd kill --port 38080
```

#### オプション 2: 別のポートを使用

```bash
vimd dev document.md --port 3000
```

#### オプション 3: ポートを使用しているプロセスを見つけて終了

```bash
# macOS/Linux
lsof -i :38080
kill -9 <PID>

# Windows
netstat -ano | findstr :38080
taskkill /PID <PID> /F
```

#### オプション 4: 設定でデフォルトポートを変更

```javascript
// ~/.vimd/config.js
export default {
  port: 3000,
  // ...
};
```

## テーマが適用されない

### 症状

プレビューにスタイルが適用されていない、または間違ったテーマが表示される。

### 解決策

1. 利用可能なテーマを確認します。

```bash
vimd theme
```

2. 設定を確認します。

```bash
vimd config --list
```

3. テーマを明示的に指定してみます。

```bash
vimd dev document.md --theme github
```

4. ソースからインストールしている場合は、再ビルドします。

```bash
npm run build
```

## ライブリロードが動作しない

### 症状

ファイルを保存してもブラウザが更新されない。

### 解決策

1. ファイルが監視されているか確認します。
   - コマンドで指定したファイルを編集していることを確認
   - `node_modules` と `.git` 内のファイルはデフォルトで無視されます

2. ブラウザコンソールでエラーを確認します

3. サーバーを再起動してみます。
   - `Ctrl+C` で停止
   - `vimd dev` を再度実行

4. ファイアウォール設定を確認します。
   - Node.js をファイアウォール経由で許可
   - localhost への接続を許可

## 画像が表示されない

### 症状

プレビューで画像が壊れて表示される。

### 解決策

1. Markdown ファイルの場所からの相対パスを使用します。

```markdown
![画像](./images/photo.png)
```

2. 絶対パスの場合は file:// プロトコルを使用します。

```markdown
![画像](file:///path/to/image.png)
```

3. 指定したパスに画像ファイルが存在することを確認します

## 設定が読み込まれない

### 症状

カスタム設定が無視される。

### 解決策

1. 設定ファイルの場所を確認します。

```bash
vimd config --list
```

2. `~/.vimd/config.js` の構文を確認します。

```javascript
// 正しい形式
export default {
  theme: 'github',
  port: 38080,  // デフォルト: 38080
};
```

3. 構文エラーを確認します。

```bash
node ~/.vimd/config.js
```

## CPU 使用率が高い

### 症状

Node.js プロセスが過剰な CPU を使用している。

### 解決策

1. 多くのファイルが監視されていないか確認します。
   - 設定で大きなディレクトリを除外

```javascript
// ~/.vimd/config.js
export default {
  watch: {
    ignored: ['node_modules', '.git', 'dist', 'build'],
  },
};
```

2. 他の vimd インスタンスを閉じます。

```bash
# 推奨: vimd kill コマンドを使用
vimd kill

# または pkill を使用
pkill -f vimd
```

## ヘルプを得る

これらの解決策でうまくいかない場合は以下をお試しください。

1. [GitHub Issues](https://github.com/notokeisho/vimd/issues) を確認
2. 以下の情報を含めて新しい issue を作成します。
   - vimd バージョン (`vimd --version`)
   - Node.js バージョン (`node --version`)
   - pandoc バージョン (`pandoc --version`)
   - オペレーティングシステム
   - 再現手順
