import { useCallback, useEffect, useState } from "react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge as FlowEdge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Note, NoteId } from "@/lib/notes";
import type { Edge } from "@/lib/edges";

type Position = { x: number; y: number };

type Props = {
  notes: Note[];
  edges: Edge[];
  selectedId: NoteId | null;
  onNodeClick: (id: NoteId) => void;
  onConnect: (source: NoteId, target: NoteId) => void;
  onEdgesDelete: (edgeIds: string[]) => void;
};

const COLUMNS = 4;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 48;

function layoutFor(index: number): Position {
  return {
    x: (index % COLUMNS) * 200,
    y: Math.floor(index / COLUMNS) * 120,
  };
}

// ノート数が変わるたびに、新しいノードも見える範囲になるよう再フィットする。
// useReactFlow は <ReactFlow> の子孫でしか呼べないため、内側の子コンポーネントに
// 分離している。
function FitViewOnCountChange({ count }: { count: number }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    fitView({ duration: 200 });
    // fitView の参照はレンダリングのたびに変わりうるため、依存配列には
    // count のみを指定する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return null;
}

export function NoteGraph({
  notes,
  edges,
  selectedId,
  onNodeClick,
  onConnect,
  onEdgesDelete,
}: Props) {
  // ノードの位置はドメインモデル(Note)ではなく、この表示コンポーネントの
  // 状態として保持する。dragされたノートの位置だけをここに記録し、それ以外は
  // レンダリング時に配列内のインデックスから計算する(seed用のeffectは不要)。
  const [positions, setPositions] = useState<Record<NoteId, Position>>({});
  // react-flowはedgesも制御コンポーネントとして扱うため、selectedをこちらで
  // 保持し明示的に渡さないと、クリックで選択してもレンダリングのたびに選択が
  // 消え、Delete/Backspaceでの削除が効かない(実機検証で確認した不具合)。
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const nodes: Node[] = notes.map((note, index) => ({
    id: note.id,
    position: positions[note.id] ?? layoutFor(index),
    data: { label: note.title || "(無題)" },
    deletable: false,
    selected: note.id === selectedId,
    // react-flowのResizeObserverによる自動計測を待たず、明示的に幅・高さを
    // 与える。width/heightだけでは内部的に「初期化未完了」と判定され続け、
    // ノードのドラッグやハンドルからの接続操作が効かない不具合が実機検証で
    // 確認されたため、measuredも明示的に与えて計測済み扱いにする。
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    measured: { width: NODE_WIDTH, height: NODE_HEIGHT },
  }));

  const flowEdges: FlowEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    selected: edge.id === selectedEdgeId,
  }));

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setPositions((prev) => {
        const current: Node[] = notes.map((note, index) => ({
          id: note.id,
          position: prev[note.id] ?? layoutFor(index),
          data: {},
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          measured: { width: NODE_WIDTH, height: NODE_HEIGHT },
        }));
        const updated = applyNodeChanges(changes, current);
        const next: Record<NoteId, Position> = {};
        updated.forEach((node) => {
          next[node.id] = node.position;
        });
        return next;
      });
    },
    [notes],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      onConnect(connection.source, connection.target);
    },
    [onConnect],
  );

  const handleEdgesDelete = useCallback(
    (deleted: FlowEdge[]) => {
      onEdgesDelete(deleted.map((edge) => edge.id));
      setSelectedEdgeId(null);
    },
    [onEdgesDelete],
  );

  if (notes.length === 0) {
    return (
      <div style={{ height: "100%", position: "relative" }}>
        <p className="empty-state-hint">
          「+ 新規ノート」でノートを作成してください
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        onPaneClick={() => setSelectedEdgeId(null)}
        fitView
      >
        <Background />
        <Controls />
        <FitViewOnCountChange count={notes.length} />
      </ReactFlow>
    </div>
  );
}
