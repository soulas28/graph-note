import { describe, expect, it } from "vitest";
import { createNote, deleteNote, type Note, updateNote } from "@/lib/notes";

describe("createNote", () => {
  it("adds a new note with the given title and content", () => {
    const result = createNote([], { title: "Hello", content: "World" });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ title: "Hello", content: "World" });
    expect(result[0].id).toBeTruthy();
  });

  it("keeps existing notes untouched", () => {
    const existing: Note[] = [{ id: "1", title: "A", content: "a" }];

    const result = createNote(existing, { title: "B", content: "b" });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(existing[0]);
  });
});

describe("updateNote", () => {
  const notes: Note[] = [{ id: "1", title: "A", content: "a" }];

  it("updates the matching note", () => {
    const result = updateNote(notes, "1", { title: "A2" });

    expect(result[0]).toEqual({ id: "1", title: "A2", content: "a" });
  });

  it("is a no-op when the id does not exist", () => {
    const result = updateNote(notes, "missing", { title: "X" });

    expect(result).toEqual(notes);
  });
});

describe("deleteNote", () => {
  const notes: Note[] = [
    { id: "1", title: "A", content: "a" },
    { id: "2", title: "B", content: "b" },
  ];

  it("removes the matching note", () => {
    const result = deleteNote(notes, "1");

    expect(result).toEqual([{ id: "2", title: "B", content: "b" }]);
  });

  it("is a no-op when the id does not exist", () => {
    const result = deleteNote(notes, "missing");

    expect(result).toEqual(notes);
  });
});
