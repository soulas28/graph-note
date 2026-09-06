# Phase 1: グラフ結合可能なノート(CRUD + ビジュアルグラフ)

## Context

Phase 0(リポジトリ基盤)は完了・マージ済み(PR #1, #2)。ここからは
`specs/product.md`(まず書き、後で構造化できるメモ環境)を実現する最初の
プロダクト機能フェーズに入る。

ユーザー指示により、今後は「Phase単位の大枠プラン」→「Featureへの分割」→
「Featureごとにブランチを切って実装・PR」というサイクルで進める。Feature
仕様(`specs/features/*.md`)は私が策定・記録する(`AGENTS.md`のSource of
Truth優先順位で2番目に位置する)。

### Phase 1 の要件(ユーザー指定)

- **Goal**: グラフ結合可能なノートを作成する。それぞれのノードでCRUDを達成する
- **NOT DO**: DB、永続化(リロードで状態が消えるインメモリ実装でよい)
- **Remarks**: KISS, YAGNI

### 確認済みの決定事項(往復で確認済み)

- グラフ表示は**ビジュアルなグラフ表示を含む**(ノード/エッジを描画する
  キャンバスUI)。データレベルのリンクに留めない
- ノート本文は**プレーンテキストのみ**(Markdown解釈・装飾は行わない)
- **Vitestを導入する**。対象はノートCRUD/リンクのロジック(純粋関数)のみ。
  UIコンポーネントテスト(React Testing Library)やE2E(Playwright)は
  まだ導入しない
- **CI(GitHub Actions)を導入する**。PR対象・単一job・`pnpm run verify`を
  ローカルと同一コマンドとして実行する。deploy/CDはPhase 1では行わない
  (詳細は後述「8. CI」)

## Recommended Plan

### 1. アーキテクチャ決定(`specs/architecture.md` を更新)

- グラフ描画ライブラリとして **`@xyflow/react`**(React Flow v12系、
  現在アクティブにメンテナンスされているパッケージ名)を新規依存として採用する。
  理由: ノードのドラッグ配置、エッジの描画・接続操作(ユーザーがノード間を
  繋ぐ操作)を自前実装すると大幅にコストが増える。この用途にはデファクトの
  ライブラリであり、「グラフ結合可能なノート」というPhase 1の要件に
  直接必要なため、YAGNIには反しない(投機的な追加ではない)
- テストランナーとして **Vitest** を導入(`vitest` + `vite-tsconfig-paths`
  のみ。jsdom/React Testing Libraryは対象外のため導入しない)
- `specs/architecture.md` の Deferred Decisions のうち「テストランナー導入」
  「graphのデータモデル」「CIパイプライン」の3項目を Current Decisions に
  移動し、上記の決定を反映
- ノートの位置情報(キャンバス上のxy座標)はノートのドメインモデルに含めず、
  グラフ表示コンポーネント側の状態として持つ(ドメインロジックを
  react-flowの都合から独立させるため)

### 2. ドメイン層の設計(Node と Edge を分離)

ユーザー指示により、ノート(Node)とその関係(Edge)を別々のドメインとして
分離する。Edgeは将来的に付随情報(ラベル・種別など)を持たせる構想があるため、
`Note`に`linkedNoteIds`を埋め込む設計は採らず、Edgeを独立したエンティティにする。

**`src/lib/notes.ts`(Feature 001が実装。Edgeを一切知らない):**

```ts
type NoteId = string;
type Note = {
  id: NoteId;
  title: string;
  content: string; // plain text
};

createNote(notes: Note[], input: { title: string; content: string }): Note[]
updateNote(notes: Note[], id: NoteId, patch: Partial<Pick<Note, "title" | "content">>): Note[]
deleteNote(notes: Note[], id: NoteId): Note[]
```

**`src/lib/edges.ts`(Feature 002が実装):**

```ts
type EdgeId = string;
type Edge = {
  id: EdgeId;
  source: NoteId;
  target: NoteId;
  // 将来: label / type / weight 等をここに追加できる(Phase 1では未実装)
};

createEdge(edges: Edge[], source: NoteId, target: NoteId): Edge[]
deleteEdge(edges: Edge[], edgeId: EdgeId): Edge[]
removeEdgesForNote(edges: Edge[], noteId: NoteId): Edge[] // ノート削除時のカスケード用
```

- `createEdge` は以下の場合に何もせず元の配列を返す(例外を投げない):
  - `source === target`(自己ループ)
  - 指定した2ノート間に、向きを問わず(無向ペアとして)既にEdgeが存在する場合
    (Phase 1では同一無向ノードペアの重複Edgeを禁止する)
- Edgeに方向(source/target)はあるが、Phase 1のUI上は無向グラフとして扱う
  (矢印表示等の方向の意味付けはしない)。将来Edgeに種別等を追加した際に
  重複可否のルールを見直す余地は残す
- **`createEdge`/`deleteEdge`/`removeEdgesForNote` は `source`/`target`/`noteId`
  に対応するNoteが実際に存在するかを検証しない**(`edges.ts`は`notes.ts`に
  依存しない設計のため)。渡されたidが実在するノートを指しているかの保証は
  呼び出し側(UI層)の責務とする
- 存在しないidへの delete は何もせず元の配列を返す(例外を投げない)
- ノート削除時は、呼び出し側(UI)が `deleteNote()` と `removeEdgesForNote()`
  の両方を呼んで整合性を取る(Feature 001単体の時点ではEdgeが存在しないため
  この連携はFeature 002導入後に発生する)

### 3. Feature 分割

`specs/features/001-note-crud.md` と `specs/features/002-graph-view-linking.md`
を新規作成し記録する。実装もこの順で1機能=1トピックブランチ=1PRで進める。

**Feature 001: ノートCRUD**

- Scope: 上記ドメイン関数(create/update/delete)+ 最小UI(ノート一覧、
  新規作成フォーム、選択中ノートの編集フォーム、削除ボタン)
- Out of scope: リンク/グラフ表示(Feature 002)、Markdown、永続化
- 受け入れ基準: 作成したノートが一覧に表示される/編集内容が反映される/
  削除すると一覧から消える
- Vitest: `src/lib/notes.test.ts` で create/update/delete(存在しないid・
  正常系)をカバー

**Feature 002: グラフ表示とリンク**

- Scope: `src/lib/edges.ts` の実装(create/delete/カスケード削除)。
  `@xyflow/react` を**素のデフォルト機能のみ**で使う薄いラッパーで、各ノートを
  デフォルトノード型として描画し、各Edgeをデフォルトエッジ型として描画する。
  ノード間をドラッグして接続すると `createEdge` でEdgeが作成される。
  エッジを選択して削除(react-flow標準の選択+Delete/Backspaceキー)すると
  `deleteEdge` が呼ばれる。ノートを削除すると `deleteNote` に加えて
  `removeEdgesForNote` を呼びカスケード削除する。ノードクリックでFeature 001の
  編集フォームを開く。新規ノート作成でキャンバスにノードが追加される
- Out of scope(**過剰な自由度・カスタマイズは作らない**):
  カスタムノード/エッジコンポーネント、レイアウトアルゴリズム(初期配置は
  単純な格子配置のみでよい)、ノード位置の永続化、Edgeの種別・ラベル等の
  付随情報(データ構造上は拡張できるが、Phase 1では実装しない)、
  複数選択一括操作、ミニマップ/コントロールパネルの独自カスタマイズ、
  ズーム/パンの独自設定。react-flowが標準で提供する挙動をそのまま使い、
  設定・抽象化レイヤーを自前で増やさないこと
- 受け入れ基準: ノードを繋ぐとEdgeが作成され画面に表示される、ノート削除で
  そのノードと関連するすべてのEdgeが消える、エッジ削除でそのEdgeのみ消え
  ノートは残る
- Vitest: `src/lib/edges.test.ts` で createEdge(自己ループ拒否・正常系・
  同一無向ペアへの重複作成が拒否されること)、deleteEdge、
  removeEdgesForNote(カスケード)を検証

### 4. UI構成(単一ページ、ルーティングなし)

- `/`(`src/app/page.tsx`)のみ。Next.jsの動的ルーティング(`/notes/[id]`等)は
  導入しない — 永続化が無くページ遷移で状態を失う設計にする理由がないため(KISS)
- 状態は最上位のクライアントコンポーネントで `useState<Note[]>` と
  `useState<Edge[]>` として別々に保持する(Node/Edgeの分離をUI層でも維持する。
  Context/状態管理ライブラリは導入しない。この規模では不要)
- 想定コンポーネント: `src/app/page.tsx`(状態とハンドラ)、
  `src/components/NoteGraph.tsx`(react-flowラッパー)、
  `src/components/NoteEditor.tsx`(選択中ノートの編集パネル)

### 5. package.json / 検証パイプラインの更新

```json
{
  "scripts": {
    "test": "vitest run",
    "verify": "pnpm run typecheck && pnpm run lint && pnpm run format:check && pnpm run test && pnpm run build"
  },
  "dependencies": { "@xyflow/react": "^..." },
  "devDependencies": { "vitest": "^...", "vite-tsconfig-paths": "^..." }
}
```

`vitest.config.ts` を新規作成し `vite-tsconfig-paths` プラグインで `@/*` を解決する。

### 6. 記録するファイル

- `specs/features/001-note-crud.md`(新規)
- `specs/features/002-graph-view-linking.md`(新規)
- `docs/plan/phase-1-graph-notes.md`(新規。本計画の記録)
- `specs/architecture.md`(更新: Current Decisions/Deferred Decisionsの見直し)
- `.github/workflows/ci.yml`(新規)

### 7. CI(GitHub Actions)

ユーザー指定の制約に従い、以下の内容で導入する:

```yaml
name: CI

on:
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker compose build
      - name: Verify
        run: docker compose run --rm web pnpm run verify
```

- トリガーは `pull_request` のみ(push/main向けトリガーは追加しない)
- 単一job(`verify`)のみ。マトリクス化や複数job分割は行わない
- ローカルの正規手順(README記載)と**同一のコマンド**
  (`docker compose build` → `docker compose run --rm web pnpm run verify`)を
  そのまま実行する。CI専用の検証ロジックは作らない
- Node/pnpmのバージョンは `Dockerfile`(Node LTS)と `package.json` の
  `packageManager`(pnpm固定)にすでに定義されている値がそのまま使われるため、
  CI側で別途バージョン指定はしない(=自動的に一致する)
- キャッシュ設定(`actions/cache`, Docker layer cache等)は追加しない。
  必要になった時点で改めて検討する(YAGNI)
- deploy/CDのジョブ・ステップは追加しない

### 8. 実装・PRの進め方

`AGENTS.md` の Git Workflow に従い、Feature 001 → Feature 002 の順に
それぞれ `feature/001-note-crud`, `feature/002-graph-view-linking` ブランチで
実装し、`pnpm run verify` を通してからPR(日本語)を作成する。マージはしない。
このプラン承認後、まず仕様ファイル一式を記録し、続けてFeature 001の実装に着手する。

各ブランチ内でのコミット粒度(1コミットにまとめるか、意味のある単位で
分割するか)は状況に応じて判断する(ユーザー確認済み・エージェントの裁量)。

## Alternatives Considered

- **データレベルのリンクのみ(グラフ描画なし)**: KISSの観点では最小だったが、
  ユーザーがビジュアルグラフ表示を明示的に選択したため不採用
- **D3.jsを直接使う**: より自由度が高いが実装コストが大きい。ノードのドラッグ・
  接続操作を一から作る必要があり、この段階ではオーバーエンジニアリング
- **ノート単位のNext.js動的ルーティング(`/notes/[id]`)**: 永続化が無い
  Phase 1では嬉しさが薄く、状態共有の設計が複雑になるだけのため不採用
- **片方向リンク**: グラフ結合の直感(繋がっている/いない)には双方向の方が
  シンプルに合致するため不採用

## Human Decisions Required

- `@xyflow/react` のライセンス(MIT)・依存追加について問題ないか

## Definition of Done (Phase 1完了の検証項目)

1. `specs/features/001-note-crud.md`, `specs/features/002-graph-view-linking.md`,
   `docs/plan/phase-1-graph-notes.md` が記録されている
2. `specs/architecture.md` が更新されている(react-flow採用、Vitest導入を反映)
3. `pnpm run verify`(typecheck/lint/format:check/**test**/build)が通る
4. Vitestで `src/lib/notes.ts`(create/update/delete)と `src/lib/edges.ts`
   (createEdge/deleteEdge/removeEdgesForNote)が、正常系・存在しないid・
   自己ループ拒否・同一無向ペアの重複Edge拒否のケースを含めて検証されている
5. UI上でノートの作成・閲覧・編集・削除ができる
6. UI上でノート同士をグラフキャンバス上で接続・切断でき、Edgeとして
   作成・削除される
7. ノート削除時に、そのノートに紐づく全てのEdgeが `removeEdgesForNote` に
   より削除される(参照整合性)
8. Feature 001, Feature 002 それぞれについて、トピックブランチ + 日本語PRが
   作成されている(マージはしない)
9. DB・永続化に関する実装が一切含まれていない(状態はインメモリのみ)
10. GitHub ActionsのCI workflow(`.github/workflows/ci.yml`)が存在する
11. Feature PRでCIが自動実行される
12. CI上で `pnpm run verify` が成功する
