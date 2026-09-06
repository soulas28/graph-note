import type { Note, NoteId } from "@/lib/notes";

type Props = {
  notes: Note[];
  selectedId: NoteId | null;
  onSelect: (id: NoteId) => void;
  onCreate: () => void;
};

export function NoteList({ notes, selectedId, onSelect, onCreate }: Props) {
  return (
    <div>
      <button type="button" onClick={onCreate}>
        + 新規ノート
      </button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelect(note.id)}
              aria-current={note.id === selectedId}
              className={
                note.id === selectedId ? "note-item--selected" : undefined
              }
            >
              {note.title || "(無題)"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
