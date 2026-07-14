import { create } from "zustand"

export type Note = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

type NoteStore = {
  notes: Record<string, Note>;
  addNote: (note: Note) => void;
  updateNote: (id: string, changes: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: {},
  addNote: (note) =>
    set((state) => ({
      notes: { ...state.notes, [note.id]: note },
    })),
  updateNote: (id, changes) =>
    set((state) => ({
      notes: { ...state.notes, [id]: { ...state.notes[id], ...changes } },
    })),
  deleteNote: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.notes;
      return { notes: rest };
    })
  },
}));
