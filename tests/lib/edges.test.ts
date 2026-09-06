import { describe, expect, it } from "vitest";
import {
  createEdge,
  deleteEdge,
  type Edge,
  removeEdgesForNote,
} from "@/lib/edges";

describe("createEdge", () => {
  it("adds a new edge between two notes", () => {
    const result = createEdge([], "a", "b");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ source: "a", target: "b" });
    expect(result[0].id).toBeTruthy();
  });

  it("rejects a self-loop", () => {
    const result = createEdge([], "a", "a");

    expect(result).toEqual([]);
  });

  it("rejects a duplicate edge for the same undirected pair, regardless of direction", () => {
    const withEdge = createEdge([], "a", "b");

    const sameDirection = createEdge(withEdge, "a", "b");
    const reverseDirection = createEdge(withEdge, "b", "a");

    expect(sameDirection).toEqual(withEdge);
    expect(reverseDirection).toEqual(withEdge);
  });

  it("allows edges between different pairs", () => {
    const withEdge = createEdge([], "a", "b");

    const result = createEdge(withEdge, "b", "c");

    expect(result).toHaveLength(2);
  });
});

describe("deleteEdge", () => {
  const edges: Edge[] = [{ id: "e1", source: "a", target: "b" }];

  it("removes the matching edge", () => {
    const result = deleteEdge(edges, "e1");

    expect(result).toEqual([]);
  });

  it("is a no-op when the id does not exist", () => {
    const result = deleteEdge(edges, "missing");

    expect(result).toEqual(edges);
  });
});

describe("removeEdgesForNote", () => {
  const edges: Edge[] = [
    { id: "e1", source: "a", target: "b" },
    { id: "e2", source: "b", target: "c" },
    { id: "e3", source: "c", target: "a" },
  ];

  it("removes every edge touching the given note, as source or target", () => {
    const result = removeEdgesForNote(edges, "a");

    expect(result).toEqual([{ id: "e2", source: "b", target: "c" }]);
  });

  it("is a no-op when no edge references the note", () => {
    const result = removeEdgesForNote(edges, "missing");

    expect(result).toEqual(edges);
  });
});
