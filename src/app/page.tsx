"use client";

import { useState } from "react";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteGraph } from "@/components/NoteGraph";
import { NoteList } from "@/components/NoteList";
import {
  createNote,
  deleteNote,
  type Note,
  type NoteId,
  updateNote,
} from "@/lib/notes";
import {
  createEdge,
  deleteEdge,
  type Edge,
  removeEdgesForNote,
} from "@/lib/edges";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<NoteId | null>(null);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;

  function handleCreate() {
    const created = createNote(notes, { title: "", content: "" });
    setNotes(created);
    setSelectedId(created[created.length - 1].id);
  }

  function handleChange(patch: Partial<Pick<Note, "title" | "content">>) {
    if (!selectedNote) return;
    setNotes(updateNote(notes, selectedNote.id, patch));
  }

  function handleDelete() {
    if (!selectedNote) return;
    setNotes(deleteNote(notes, selectedNote.id));
    setEdges((current) => removeEdgesForNote(current, selectedNote.id));
    setSelectedId(null);
  }

  function handleConnect(source: NoteId, target: NoteId) {
    setEdges((current) => createEdge(current, source, target));
  }

  function handleEdgesDelete(edgeIds: string[]) {
    setEdges((current) =>
      edgeIds.reduce((acc, id) => deleteEdge(acc, id), current),
    );
  }

  return (
    <main>
      <h1>graph-note</h1>
      <NoteList
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
      />
      <NoteGraph
        notes={notes}
        edges={edges}
        onNodeClick={setSelectedId}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
      />
      {selectedNote && (
        <NoteEditor
          note={selectedNote}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
