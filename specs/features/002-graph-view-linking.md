# Feature 002: グラフ表示とリンク

Phase: [Phase 1](../../docs/plan/phase-1-graph-notes.md)
Depends on: [Feature 001: ノートCRUD](001-note-crud.md)

## Goal

ノート([Feature 001](001-note-crud.md))をグラフのノードとしてビジュアル表示し、
ノート同士をキャンバス上で接続・切断できる。

## Scope

- ドメインモデル: `Edge { id, source: NoteId, target: NoteId }`
  (Noteとは独立したエンティティ。将来 `label`/`type` 等の付随情報を
  追加できる余地を残す)
- ドメイン関数(`src/lib/edges.ts`、永続化を持たない純粋関数):
  - `createEdge(edges, source, target)`
  - `deleteEdge(edges, edgeId)`
  - `removeEdgesForNote(edges, noteId)` — ノート削除時のカスケード用
- UI: `@xyflow/react` によるグラフキャンバス。各ノートをデフォルトノード型、
  各Edgeをデフォルトエッジ型で描画する。ノード間をドラッグして接続すると
  Edgeが作成され、エッジを選択して削除(react-flow標準の選択+Delete/Backspace)
  するとEdgeが削除される。ノードクリックでFeature 001の編集フォームを開く

## Out of Scope

- カスタムノード/エッジコンポーネント
- レイアウトアルゴリズム(初期配置は単純な格子配置のみ)
- ノード位置の永続化
- Edgeの種別・ラベル等の付随情報の実装(データ構造上の拡張余地のみ用意する)
- 複数選択一括操作、ミニマップ/コントロールパネルの独自カスタマイズ、
  ズーム/パンの独自設定(react-flowの標準機能をそのまま使う)
- DB・永続化

## Domain Rules

- `createEdge` は以下の場合、何もせず元の配列を返す(例外を投げない):
  - `source === target`(自己ループ)
  - 指定した2ノート間に、向きを問わず(無向ペアとして)既にEdgeが存在する場合
    (Phase 1では同一無向ノードペアの重複Edgeを禁止する)
- `deleteEdge`/`removeEdgesForNote` は存在しないidを渡された場合、何もせず
  元の配列をそのまま返す
- `edges.ts` は `source`/`target`/`noteId` に対応するNoteが実際に存在するかを
  検証しない(`notes.ts` に依存しない設計のため)。渡されたidが実在する
  ノートを指しているかの保証は呼び出し側(UI層)の責務とする
- ノート削除時は、呼び出し側(UI)が `deleteNote()` と `removeEdgesForNote()`
  の両方を呼んで整合性を取る

## Acceptance Criteria

- ノード同士を接続するとEdgeが作成され画面に表示される
- ノートを削除すると、そのノードと紐づく全てのEdgeが消える
- エッジを削除すると、そのEdgeのみ消えノートは残る

## Verification

- `tests/lib/edges.test.ts`(Vitest)で `createEdge`(自己ループ拒否・正常系・
  同一無向ペアへの重複作成が拒否されること)、`deleteEdge`、
  `removeEdgesForNote`(カスケード)を検証する
- `pnpm run verify` が通ること
