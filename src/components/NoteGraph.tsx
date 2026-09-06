import { useCallback, useState } from "react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
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
  onNodeClick: (id: NoteId) => void;
  onConnect: (source: NoteId, target: NoteId) => void;
  onEdgesDelete: (edgeIds: string[]) => void;
};

const COLUMNS = 4;

function layoutFor(index: number): Position {
  return {
    x: (index % COLUMNS) * 200,
    y: Math.floor(index / COLUMNS) * 120,
  };
}

export function NoteGraph({
  notes,
  edges,
  onNodeClick,
  onConnect,
  onEdgesDelete,
}: Props) {
  // ノードの位置はドメインモデル(Note)ではなく、この表示コンポーネントの
  // 状態として保持する。dragされたノートの位置だけをここに記録し、それ以外は
  // レンダリング時に配列内のインデックスから計算する(seed用のeffectは不要)。
  const [positions, setPositions] = useState<Record<NoteId, Position>>({});

  const nodes: Node[] = notes.map((note, index) => ({
    id: note.id,
    position: positions[note.id] ?? layoutFor(index),
    data: { label: note.title || "(無題)" },
    deletable: false,
  }));

  const flowEdges: FlowEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setPositions((prev) => {
        const current: Node[] = notes.map((note, index) => ({
          id: note.id,
          position: prev[note.id] ?? layoutFor(index),
          data: {},
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
    },
    [onEdgesDelete],
  );

  return (
    <div style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
