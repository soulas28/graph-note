"use client";

import { useState } from "react";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteList } from "@/components/NoteList";
import {
  createNote,
  deleteNote,
  type Note,
  type NoteId,
  updateNote,
} from "@/lib/notes";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
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
    setSelectedId(null);
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
