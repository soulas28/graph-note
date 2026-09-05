# Phase 0: Repository Bootstrap

## Context

`graph-note` は仕様駆動・検証駆動で開発するプロジェクト。現状のリポジトリには
`AGENTS.md`(運用ルール)と `specs/product.md`(プロダクトビジョンのみ)があるが、
`specs/architecture.md` は空、`specs/features/` と `docs/` は未作成、`package.json`
すら存在しない完全な白紙状態(コミット履歴もゼロ)。

`AGENTS.md` は検証コマンドを明記しており、優先順位は
`product.md > features/* > architecture.md > tests > implementation`。今回の
Phase 0 はプロダクト機能を一切実装せず、「今後Feature Specを1つずつ実装・検証できる
最小のWebアプリ基盤」を作ることが目的。

以下はユーザーとの往復で決定済み:

- フレームワーク: **Next.js (App Router) + TypeScript**
- リポジトリ構成: **単一パッケージ**
- パッケージマネージャ: **pnpm**(corepackでバージョン固定)
- 実行環境: **Docker**(開発機のNode.jsバージョンに依存させない。イメージはNode.js LTSに固定)
- `pnpm run verify` に `next build` を含める
- `specs/architecture.md` は「Current Decisions / Current Constraints / Deferred
  Decisions」の3セクションのみで構成し、将来の具体的なアーキテクチャは先回りして書かない
- 永続化方針は「Next.jsのサーバー機能を使う選択肢を持てる」ことを軸としつつ、
  「localStorage等クライアント完結案も検討中」であることを明記する(未確定)。
  Next.js採用は将来のバックエンドアーキテクチャをNext.js内に拘束するものではない
- 「graph-note」の"graph"はリテラルなグラフ(ノード/エッジ)として扱う方向で確認済みだが、
  詳細設計はFeature Spec策定時まで議論しない(Phase 0のファイルには書かない)

### 既存ファイルへの変更(要注意)

`AGENTS.md` には現在「`npm run verify`」という具体的なコマンドが明記されている。
pnpm採用に伴い、この一行を **`pnpm run verify`** に書き換える必要がある。これは
「既存の設計意図を勝手に変更しない」という制約に抵触しうる変更だが、今回のセッションで
ユーザーが明示的にpnpmへの切り替えを指示したため、意図的な上書きとしてこの計画に含める。
他にAGENTS.mdの優先順位・運用ルール自体は変更しない。

## Recommended Plan

### 1. 技術スタックと理由

| 項目                                 | 選定                                   | 理由                                                                                                                                                                                                                                         |
| ------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フレームワーク                       | Next.js (App Router)                   | 将来のグラフ表示・リッチテキスト編集ライブラリの選択肢が豊富。API Routes/Server Actionsを同一リポジトリ内で使う「選択肢」を持てるが、将来のバックエンドアーキテクチャをNext.js内に拘束するものではなく、別サービスとして切り出す可能性も残す |
| 言語                                 | TypeScript (strict)                    | 検証駆動方針、将来のVitest/Playwright導入と相性が良い                                                                                                                                                                                        |
| パッケージマネージャ                 | pnpm(corepack固定)                     | ユーザー指定。`packageManager` フィールドでバージョンを固定し、再現性を確保                                                                                                                                                                  |
| 実行環境                             | Docker(Node.js LTS固定イメージ)        | 開発機のローカルNodeバージョンに依存させないため。`Dockerfile` + `docker-compose.yml` で `pnpm run dev` / `pnpm run verify` を同一環境で実行可能にする                                                                                       |
| Lint                                 | ESLint(`eslint-config-next` 同梱設定)  | Next.js公式スキャフォールドに標準付属。追加の設計判断が不要                                                                                                                                                                                  |
| Format                               | Prettier(設定ファイルなし、デフォルト) | ルール議論のコストを避ける。ESLintとの役割分担(ロジック vs 整形)を明確化                                                                                                                                                                     |
| スタイリング/状態管理/DB/認証/AI SDK | 導入しない                             | specsに記載なし、現時点で不要(YAGNI)                                                                                                                                                                                                         |

### 2. 作成・変更するファイル

**スキャフォールド生成方法(既存ファイル保護)**: リポジトリ直下には既に `AGENTS.md`
と `specs/`(非空)が存在するため、`create-next-app` はカレントディレクトリを
「衝突あり」と判定し安全に実行できない可能性が高い。そのため以下の手順を取る。

1. リポジトリ外の一時ディレクトリ(例: スクラッチパッド配下)で
   `npx create-next-app@latest <tmp-dir> --typescript --eslint --app --src-dir --import-alias "@/*" --no-tailwind` を実行し、まっさらな状態でスキャフォールドを生成する
2. 生成物のうち必要なファイルのみ(`package.json` のベース、`tsconfig.json`、
   `eslint.config.mjs`、`next.config.ts`、`src/app/layout.tsx`、
   `src/app/page.tsx`、`public/favicon.ico` 等)を選別してリポジトリへコピーする
3. `AGENTS.md`、`specs/`、および既存の `README.md` の扱いは一切スキャフォールドから
   コピーしない。`README.md` と `specs/architecture.md` はこの計画で定めた内容を
   手動で書く(空ファイルへの記入であり上書きではない)
4. `.gitignore` / `.dockerignore` / `.prettierignore` もスキャフォールド生成物を
   参考にしつつ、pnpm/Docker構成に合わせて手動で作成する
5. 万一 `create-next-app` が一時ディレクトリでも実行できない場合は、Next.js公式
   ドキュメントの最小構成(`package.json`, `tsconfig.json`, `next.config.ts`,
   `src/app/layout.tsx`, `src/app/page.tsx`)を手書きするフォールバックを取る

**新規作成:**

- `package.json` — scripts整理、`packageManager`(pnpm@x.y.z, corepack管理)、`engines.node` に現行Node.js LTSの範囲(例: `">=24.0.0 <25.0.0"`。実装時の最新LTSに合わせて確定)
- `pnpm-lock.yaml`(`pnpm install` で自動生成)
- `.npmrc` — `engine-strict=true` を設定(誤ってDocker外で実行した際に `engines` 不一致を即座に検知させるための保険。ローカル直接実行を公式サポートするものではない)
- `tsconfig.json`(`create-next-app` 生成の `strict: true` をそのまま採用)
- `.gitignore`(標準的なNext.js向け内容。Vitest/Playwrightの出力先は導入時に追記)
- `.prettierignore`(`.next`, `node_modules` を除外)
- `eslint.config.mjs`(`create-next-app` 生成のまま)
- `src/app/layout.tsx`, `src/app/page.tsx` — Next標準のマーケティング用コンテンツを削除し、「Phase 0: bootstrap only, no product features yet」という中立的なプレースホルダーに置き換え
- `Dockerfile` — `node:24-slim`(LTS)ベース、corepack有効化、`pnpm install --frozen-lockfile`、`CMD ["pnpm", "run", "dev"]`
- `docker-compose.yml` — `web` サービス。ソースをボリュームマウントしホットリロード対応、`node_modules`/`.next` は匿名ボリュームで隔離、ポート3000を公開
- `.dockerignore` — `node_modules`, `.next`, `.git` を除外
- `README.md`(空 → 記入) — Docker経由での起動・検証手順のみを記載(`docker compose up`, `docker compose run --rm web pnpm run verify`)。Dockerが唯一の公式サポート実行方法であることを明記し、ローカル直接実行の手順は記載しない
- `specs/architecture.md`(空 → 記入) — 下記3セクションのみ
- `docs/plan/phase-0-bootstrap.md` — 本計画(Context / Recommended Plan / Alternatives Considered / Human Decisions Required / Definition of Done)をそのままリポジトリに記録する。`specs/architecture.md` は最小構成(現状決定・制約・保留事項のみ)に留める方針のため、計画の経緯・検討過程はこちらに残す

**変更:**

- `AGENTS.md` — 検証コマンドの一行を `npm run verify` → `pnpm run verify` に変更(上記「既存ファイルへの変更」参照)

**削除:**

- `create-next-app` が生成する不要な装飾アセット(favicon以外の`public/*.svg`等)

### 3. `specs/architecture.md` の内容構成

```markdown
# Architecture

## Current Decisions

- Framework: Next.js (App Router) + TypeScript, single package. This gives
  the option to use Next.js server features (API Routes/Server Actions)
  later, but does not lock the future backend architecture into Next.js —
  a separate backend service remains a possibility
- Package manager: pnpm (pinned via corepack / `packageManager` field)
- Runtime: Node.js LTS, executed via Docker (Dockerfile + docker-compose.yml).
  Docker is the sole canonical way to run/build/verify this project —
  local host execution is not a documented/supported path
- Static verification: TypeScript strict, ESLint (eslint-config-next),
  Prettier (default config), aggregated via `pnpm run verify`
  (typecheck && lint && format:check && build)
- No DB / auth / AI SDK / CSS framework / state management library in Phase 0

## Current Constraints

- No product features implemented yet — this repo is bootstrap-only (Phase 0)
- specs/product.md is the highest-priority source of truth; nothing here may
  contradict it
- No test runner (Vitest/Playwright) and no CI pipeline yet

## Deferred Decisions

- Persistence approach: Next.js server features are an available option, but
  a client-only approach (localStorage/IndexedDB) is also under
  consideration — not decided, revisit when the relevant feature spec is
  written
- Whether `next build` stays inside `pnpm run verify` long-term or moves to
  a CI-only step
- Test runner introduction (Vitest / Playwright), test file location/naming
  convention, and CI pipeline
- Data model for "graph" (nodes/edges) — deferred to feature specs
```

(冗長な将来設計の記述は行わない。ユーザー指示どおり最小限)

### 4. package.json の scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "verify": "pnpm run typecheck && pnpm run lint && pnpm run format:check && pnpm run build"
  }
}
```

- `test` / `test:e2e` は今は追加しない(Vitest/Playwright未導入のため)

### 5. 静的検証構成(最低限)

- TypeScript: `strict: true`
- ESLint: `eslint-config-next` 既定ルールのみ
- Prettier: デフォルト設定、`format:check` を `verify` に組み込み
- ESLint/Prettier競合回避用の追加パッケージ(`eslint-config-prettier`等)は導入しない(既定設定はスタイル系ルールをほぼ含まないため)

### 6. 将来のVitest/Playwright/CI導入を見据えた設計上の配慮

- `src/` ディレクトリ + `@/*` パスエイリアス → Vitest(`vite-tsconfig-paths`)/Playwrightのimportがそのまま使える
- `verify` を `&&` チェーンにしておくことで、後で `pnpm run test` / `pnpm run test:e2e` を追記するだけで済む
- テストファイルの配置・命名規約(colocateするか等)は今は決めない(Deferred。テストランナー導入時に決定)
- Dockerイメージ・compose構成があることで、CI導入時も同じコンテナ定義を流用できる(`docker compose run --rm web pnpm run verify` をCIから呼ぶだけで済む)
- CI設定ファイル(`.github/workflows/*`)は今回作成しない

### 7. この段階で導入しないもの

- Tailwind等のCSSフレームワーク、UIコンポーネントライブラリ
- 状態管理ライブラリ、DB/ORM、認証、AI/LLM SDK
- Vitest, Playwright本体、CI設定ファイル
- モノレポツール(単一パッケージのため不要)
- 本番用マルチステージDockerfile(Phase 0は開発起動が目的。デプロイ用ビルドは別途検討)

## Alternatives Considered

- **npm(既定のまま)**: `AGENTS.md` に既に明記されており変更コストがなかったが、ユーザーがpnpmを明示的に指定したため採用しない。代わりに `AGENTS.md` の一行を更新する
- **Docker常時必須にせずローカルNode.jsのみ、またはDocker+ローカル併用**: 開発体験としては軽いが、「Docker環境のみを正とする」という明示的な要望に反するため不採用。ローカル直接実行は公式手順として文書化せず、`.npmrc`の`engine-strict`は誤実行時の保険としてのみ残す
- **本番用マルチステージDockerfile**: デプロイ先が未定(specsに記載なし)のため、Phase 0では開発用の単一ステージに留め、本番ビルドは将来のデプロイ要件が固まってから設計する

## Human Decisions Required

1. **Node.js LTSのバージョン範囲の広さ**: 「上下で範囲を持たせる」との指示を、現行LTSメジャー1本(例: `">=24.0.0 <25.0.0"`)に限定する解釈で計画した。複数LTSメジャーにまたがる範囲(例: 20系も許容)を希望する場合は要調整

- 実装時点の正確なpnpmバージョン(corepackで固定する具体的なsemver)は、スキャフォールド実行時に最新安定版を確認して確定する(計画時点では未確定のバージョンを決め打ちしない)

## Definition of Done (Phase 0 completion verification)

1. `pnpm install`(またはDocker経由のビルド)がエラーなく完了する
2. `docker compose build` が成功する
3. `docker compose up` でコンテナが起動し、ホストの `localhost:3000` でプレースホルダーページが200で表示される
4. `docker compose run --rm web pnpm run verify` がエラーなく完走する(typecheck/lint/format:check/build)
5. `specs/architecture.md` に Current Decisions / Current Constraints / Deferred Decisions が記載されている
6. `README.md` にDocker経由の起動・検証手順が記載されている(ローカル直接実行手順は記載しない)
7. `AGENTS.md` の検証コマンドが `pnpm run verify` に更新されている
8. プロダクト機能(ノート作成・グラフ表示・保存等)が一切実装されていない(プレースホルダー画面のみ)ことをコードレビューで確認
9. 禁止依存関係(DB/ORM/認証/AI SDK/CSSフレームワーク/Vitest/Playwright/CIツール)が `package.json` に含まれていないことを確認
10. `.gitignore` / `.dockerignore` により `node_modules`, `.next` 等がリポジトリ・イメージに含まれない
11. `docs/plan/phase-0-bootstrap.md` に本計画(Context/Recommended Plan/Alternatives/Human Decisions/DoD)が記録されている
