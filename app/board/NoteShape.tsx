import { createClient } from "@/lib/supabase/client";
import { Note, useNoteStore } from "../store/useNoteStore"
import { Rect } from "react-konva";
import { useEffect, useRef } from "react";
import { useWsStore } from "../store/useWsStore";

interface Props {
  noteData: Note
}

const NoteShape = ({ noteData }: Props) => {
  const updateNote = useNoteStore((n) => n.updateNote)
  const deleteNode = useNoteStore((n) => n.deleteNote)
  const ws = useWsStore(ws => ws.ws)
  const lastSentRef = useRef(0)

  async function updateNoteToDB(id: string, changes: Partial<Note>) {
    updateNote(id, changes)

    const supabase = createClient()
    const { error } = await supabase.from("Notes").update(changes).eq("id", id)

    if (error) console.error(error)

    const message = {
      action: "update",
      id: id,
      changes: changes
    }

    ws?.send(JSON.stringify(message))
  }

  function sendUpdateToWs(message: { action: string, id: string, changes: Partial<Note> }) {
    ws?.send(JSON.stringify(message))
  }

  async function deleteNoteInDB(id: string) {
    deleteNode(id)

    const supabase = createClient()
    const response = await supabase.from("Notes").delete().eq("id", id)

    const message = {
      action: "delete",
      id: id,
    }

    ws?.send(JSON.stringify(message))
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
      onDragMove={(e) => {
        const newPos = { x: e.target.x(), y: e.target.y() }
        updateNote(noteData.id, newPos)

        const now = Date.now()
        if (now - lastSentRef.current > 100) {
          sendUpdateToWs({ action: "update", id: noteData.id, changes: newPos })
          lastSentRef.current = now
        }
      }}
      onDragEnd={(e) => { updateNoteToDB(noteData.id, { x: e.target.x(), y: e.target.y() }) }}
      onDblClick={() => deleteNoteInDB(noteData.id)}
    />
  )
}

export default NoteShape
