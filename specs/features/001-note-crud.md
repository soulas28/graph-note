# Feature 001: ノートCRUD

Phase: [Phase 1](../../docs/plan/phase-1-graph-notes.md)

## Goal

ノート(プレーンテキスト)を作成・閲覧・編集・削除できる。

## Scope

- ドメインモデル: `Note { id, title, content }`(`content` はプレーンテキスト)
- ドメイン関数(`src/lib/notes.ts`、永続化を持たない純粋関数):
  - `createNote(notes, input)` — 新規ノートを追加した配列を返す
  - `updateNote(notes, id, patch)` — 指定idの `title`/`content` を更新した配列を返す
  - `deleteNote(notes, id)` — 指定idのノートを取り除いた配列を返す
- UI: ノート一覧表示、新規作成フォーム、選択中ノートの編集フォーム、削除ボタン

## Out of Scope

- ノート間のリンク・グラフ表示([Feature 002](002-graph-view-linking.md) で対応)
- Markdown解釈・リッチテキスト
- DB・永続化(状態はインメモリのみ、リロードで消える)

## Domain Rules

- `updateNote`/`deleteNote` は存在しないidを渡された場合、何もせず元の配列を
  そのまま返す(例外を投げない)
- `notes.ts` はEdge(ノート間の関係)について一切関知しない

## Acceptance Criteria

- ノートを作成すると一覧に表示される
- ノートの `title`/`content` を編集すると一覧・詳細に反映される
- ノートを削除すると一覧から消える

## Verification

- `tests/lib/notes.test.ts`(Vitest)で `createNote`/`updateNote`/`deleteNote` の
  正常系、および存在しないidに対する呼び出しが no-op になることを検証する
- `pnpm run verify` が通ること
