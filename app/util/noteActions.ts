import { createClient } from "@/lib/supabase/client"
import { Note, useNoteStore } from "../store/useNoteStore"
import { useWsStore } from "../store/useWsStore"
import { NoteEntry, useUndoRedoStore } from "../store/useUndoRedoStore"

export async function updateNoteToDB(id: string, changes: Partial<Note>, isUndoRedo: boolean = false) {
  const before = { ...useNoteStore.getState().notes[id] }
  useNoteStore.getState().updateNote(id, changes)

  const supabase = createClient()
  const { error } = await supabase.from("Notes").update(changes).eq("id", id)

  if (error) console.error(error)

  const message = {
    action: "update",
    id: id,
    changes: changes
  }

  useWsStore.getState().sendMessage(JSON.stringify(message))

  if (!isUndoRedo) {
    useUndoRedoStore.getState().clearRedoEntries()
    const after = { ...useNoteStore.getState().notes[id] }
    const entry: NoteEntry = {
      action: "update",
      noteId: id,
      before: before,
      after: after
    }
    useUndoRedoStore.getState().addEntry(entry)
  }
}

export async function deleteNoteInDB(id: string, isUndoRedo: boolean = false) {
  const before = { ...useNoteStore.getState().notes[id] }
  useNoteStore.getState().deleteNote(id)

  const supabase = createClient()
  const response = await supabase.from("Notes").delete().eq("id", id)

  const message = {
    action: "delete",
    id: id,
  }

  useWsStore.getState().sendMessage(JSON.stringify(message))
  if (!isUndoRedo) {
    useUndoRedoStore.getState().clearRedoEntries()
    const entry: NoteEntry = {
      action: "delete",
      noteId: id,
      before: before,
    }
    useUndoRedoStore.getState().addEntry(entry)
  }
}
export async function addNewNote(roomId: string | null = null, isUndoRedo: boolean = false) {
  const id = crypto.randomUUID()
  const newNote: Note = {
    id: id,
    x: 50, y: 50,
    width: 150, height: 150,
    text: "new note",
    room_id: roomId,
    scale_x: 1,
    scale_y: 1,
    font_size: 16,
  }
  useNoteStore.getState().addNote(newNote)

  const supabase = createClient()
  const { error } = await supabase.from("Notes").insert(newNote)

  if (error) console.error(error);

  const message = {
    action: "create",
    note: newNote
  }

  useWsStore.getState().sendMessage(JSON.stringify(message))
  if (!isUndoRedo) {
    useUndoRedoStore.getState().clearRedoEntries()
    const entry: NoteEntry = {
      action: "create",
      noteId: id,
      after: newNote
    }
    useUndoRedoStore.getState().addEntry(entry)
  }
}

export async function recoverNote(note: Note, roomId: string | null = null, isUndoRedo: boolean = false) {
  const newNote = note
  useNoteStore.getState().addNote(newNote)

  const supabase = createClient()
  const { error } = await supabase.from("Notes").insert(newNote)

  if (error) console.error(error);

  const message = {
    action: "create",
    note: newNote
  }

  useWsStore.getState().sendMessage(JSON.stringify(message))
  if (!isUndoRedo) {
    useUndoRedoStore.getState().clearRedoEntries()
    const entry: NoteEntry = {
      action: "create",
      noteId: newNote.id,
      after: newNote
    }
    useUndoRedoStore.getState().addEntry(entry)
  }
}
