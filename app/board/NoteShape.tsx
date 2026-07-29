import { createClient } from "@/lib/supabase/client";
import { Note, useNoteStore } from "../store/useNoteStore"
import { Rect, Text, Group } from "react-konva";
import { useEffect, useRef } from "react";
import { useWsStore } from "../store/useWsStore";
import { deleteNoteInDB, updateNoteToDB } from "../util/noteActions";

interface Props {
  noteData: Note
}

const NoteShape = ({ noteData }: Props) => {
  const updateNote = useNoteStore((n) => n.updateNote)
  const deleteNode = useNoteStore((n) => n.deleteNote)
  const ws = useWsStore(ws => ws.ws)
  const lastSentRef = useRef(0)


  function sendUpdateToWs(message: { action: string, id: string, changes: Partial<Note> }) {
    ws?.send(JSON.stringify(message))
  }

  return (
    <>
      <Group
        x={noteData.x}
        y={noteData.y}
        draggable
        onDragMove={(e) => {
          const newPos = { x: e.target.x(), y: e.target.y() }

          const now = Date.now()
          if (now - lastSentRef.current > 50) {
            sendUpdateToWs({ action: "update", id: noteData.id, changes: newPos })
            lastSentRef.current = now
          }
        }}
        onDragEnd={(e) => { updateNoteToDB(noteData.id, { x: e.target.x(), y: e.target.y() }) }}
        onDblClick={() => deleteNoteInDB(noteData.id)}
      >
        <Rect
          width={noteData.width}
          height={noteData.height}
          fill="red"
          shadowBlur={10}
          draggable
        />
        <Text
          x={5}
          y={5}
          text={noteData.text}
          width={noteData.width}
          height={noteData.height}
        />
      </Group>
    </>
  )
}

export default NoteShape
