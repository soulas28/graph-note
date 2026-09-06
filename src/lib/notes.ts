export type NoteId = string;

export type Note = {
  id: NoteId;
  title: string;
  content: string;
};

export function createNote(
  notes: Note[],
  input: { title: string; content: string },
): Note[] {
  const note: Note = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
  };
  return [...notes, note];
}

export function updateNote(
  notes: Note[],
  id: NoteId,
  patch: Partial<Pick<Note, "title" | "content">>,
): Note[] {
  return notes.map((note) => (note.id === id ? { ...note, ...patch } : note));
}

export function deleteNote(notes: Note[], id: NoteId): Note[] {
  return notes.filter((note) => note.id !== id);
}
