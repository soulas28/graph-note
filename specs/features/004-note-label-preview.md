# Feature 004: 空ノートの識別性向上(一覧プレビュー表示)

Phase: [Phase 2](../../docs/plan/phase-2-usability.md)

## Goal

タイトル未入力のノートが複数あると一覧で区別できない問題を解消する。

## Scope

- `NoteList` の各項目のラベルを次のルールに変更する: タイトルが空なら本文の
  先頭N文字(例: 20文字)+省略記号、それも空なら「(無題)」
- グラフノードのラベル(`NoteGraph`)も一覧と同じルールに統一し、表示の
  一貫性を保つ
- 純粋なフォーマット関数(例: `formatNoteLabel(note): string`)を
  `src/lib/notes.ts` に追加する

## Out of Scope

- Markdownやリッチな本文プレビュー(プレーンテキストの先頭文字のみ)
- 一覧の並び替え・検索・フィルタ

## Domain Rules

- `formatNoteLabel` は純粋関数とし、`title` が非空ならそのまま返す。空なら
  `content` の先頭N文字+省略記号を返す。両方空なら「(無題)」を返す

## Acceptance Criteria

- タイトル未入力で本文が異なる複数ノートが、一覧上で区別できる

## Verification

- `tests/lib/notes.test.ts` に `formatNoteLabel` のテストを追加する
  (タイトルあり/タイトルなし+本文あり/両方空、の3パターン)
- `pnpm run verify` が通ること
