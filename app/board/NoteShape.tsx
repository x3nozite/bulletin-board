import { createClient } from "@/lib/supabase/client";
import { Note, useNoteStore } from "../store/useNoteStore"
import { Rect } from "react-konva";

interface Props {
  noteData: Note
}

const NoteShape = ({ noteData }: Props) => {
  const updateNote = useNoteStore((n) => n.updateNote)

  async function updateNoteToDB(id: string, changes: Partial<Note>) {
    updateNote(id, changes)

    const supabase = createClient()
    const { error } = await supabase.from("Notes").update(changes).eq("id", id)

    if (error) console.error(error)
  }

  const deleteNode = useNoteStore((n) => n.deleteNote)

  async function deleteNoteInDB(id: string) {
    deleteNode(id)

    const supabase = createClient()
    const response = await supabase.from("Notes").delete().eq("id", id)
  }

  return (
    <Rect
      x={noteData.x}
      y={noteData.y}
      width={noteData.width}
      height={noteData.height}
      fill="red"
      shadowBlur={10}
      draggable
      onDragEnd={(e) => { updateNoteToDB(noteData.id, { x: e.target.x(), y: e.target.y() }) }}
      onDblClick={() => deleteNoteInDB(noteData.id)}
    />
  )
}

export default NoteShape
