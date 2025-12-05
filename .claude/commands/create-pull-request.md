# Create Pull Request

origin HEADとの差分を調べて、適切なブランチ名を考えて、git pushし、Pull Requestを作成する。

## 手順

1. 現在のブランチの変更内容を確認
2. origin/HEADとの差分を調べる
3. 変更内容に基づいて適切なブランチ名を生成
4. `git push origin HEAD:生成したブランチ名` を実行
5. `gh pr create --head ブランチ名` でPull Requestを作成

## 注意点

- PR作成時は `--head` オプションでブランチ名を明示的に指定する
- ローカルブランチとリモートブランチの名前が異なる場合があるため
- エラーが発生した場合は適切なヘッドブランチを指定してリトライする
