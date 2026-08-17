import { create } from "zustand"
import { Note, useNoteStore } from "./useNoteStore"
import { addNewNote, deleteNoteInDB, recoverNote, updateNoteToDB } from "../util/noteActions"
import { toast } from "sonner"

export type NoteEntry =
  { action: "update", noteId: string, before: Note, after: Note, } |
  { action: "create", noteId: string, after: Note } |
  { action: "delete", noteId: string, before: Note }


type UndoRedoStore = {
  undoEntries: NoteEntry[],
  redoEntries: NoteEntry[],
  addEntry: (entry: NoteEntry) => void,
  undo: () => void,
  redo: () => void,
  applyEntry: (entry: NoteEntry, direction: "undo" | "redo") => void,
  clearRedoEntries: () => void,
}

export const useUndoRedoStore = create<UndoRedoStore>((set, get) => ({
  undoEntries: [],
  redoEntries: [],
  addEntry: (entry) =>
    set((state) => ({
      undoEntries: [...state.undoEntries, entry]
    })),
  undo: () => {
    const entry = get().undoEntries.at(-1)
    if (!entry) return
    get().applyEntry(entry, "undo")
    set((state) => ({
      undoEntries: state.undoEntries.slice(0, -1),
      redoEntries: [...state.redoEntries, entry]
    }))
  },
  redo: () => {
    const entry = get().redoEntries.at(-1)
    if (!entry) return
    get().applyEntry(entry, "redo")
    set((state) => ({
      redoEntries: state.redoEntries.slice(0, -1),
      undoEntries: [...state.undoEntries, entry]
    }))
  },
  applyEntry: (entry, direction) => {
    const note = useNoteStore.getState().notes[entry.noteId]

    switch (entry.action) {
      case "create":
        if (direction === "undo") {
          if (!note) {
            toast("Undo failed — note no longer exists")
            return
          }
          deleteNoteInDB(entry.noteId, true)
        } else {
          if (note) {
            toast("Redo failed — note already exists")
            return
          }
          recoverNote(entry.after, null, true)
        }
        break
      case "update":
        if (!note) toast("Failed — note no longer exists")
        const prev = direction !== "undo" ? entry.before : entry.after
        const target = direction === "undo" ? entry.before : entry.after
        if (JSON.stringify(note) !== JSON.stringify(prev)) return
        updateNoteToDB(entry.noteId, target, true)
        break
      case "delete":
        if (direction === "undo") {
          if (note) {
            toast("Undo failed — note already exists")
          }
          recoverNote(entry.before, null, true)
        } else {
          if (!note) {
            toast("Redo failed — note no longer exists")
            return
          }
          deleteNoteInDB(entry.noteId, true)
        }
        break
    }
  },
  clearRedoEntries: () =>
    set(() => ({
      redoEntries: []
    })),
}))
