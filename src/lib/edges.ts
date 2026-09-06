import type { NoteId } from "@/lib/notes";

export type EdgeId = string;

export type Edge = {
  id: EdgeId;
  source: NoteId;
  target: NoteId;
  // 将来: label / type / weight 等をここに追加できる(Phase 1では未実装)
};

function isSamePair(a: Edge, source: NoteId, target: NoteId): boolean {
  return (
    (a.source === source && a.target === target) ||
    (a.source === target && a.target === source)
  );
}

export function createEdge(
  edges: Edge[],
  source: NoteId,
  target: NoteId,
): Edge[] {
  if (source === target) return edges;
  if (edges.some((edge) => isSamePair(edge, source, target))) return edges;

  return [...edges, { id: crypto.randomUUID(), source, target }];
}

export function deleteEdge(edges: Edge[], edgeId: EdgeId): Edge[] {
  return edges.filter((edge) => edge.id !== edgeId);
}

export function removeEdgesForNote(edges: Edge[], noteId: NoteId): Edge[] {
  return edges.filter(
    (edge) => edge.source !== noteId && edge.target !== noteId,
  );
}
