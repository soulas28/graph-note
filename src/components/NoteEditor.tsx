import type { Note } from "@/lib/notes";

type Props = {
  note: Note;
  onChange: (patch: Partial<Pick<Note, "title" | "content">>) => void;
  onDelete: () => void;
};

export function NoteEditor({ note, onChange, onDelete }: Props) {
  return (
    <div>
      <input
        value={note.title}
        placeholder="タイトル"
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <textarea
        value={note.content}
        placeholder="本文"
        onChange={(e) => onChange({ content: e.target.value })}
      />
      <button type="button" onClick={onDelete}>
        削除
      </button>
    </div>
  );
}
