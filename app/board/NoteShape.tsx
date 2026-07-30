import { createClient } from "@/lib/supabase/client";
import { Note, useNoteStore } from "../store/useNoteStore"
import { Rect, Text, Group } from "react-konva";
import { RefObject, useEffect, useRef } from "react";
import { useWsStore } from "../store/useWsStore";
import { deleteNoteInDB, updateNoteToDB } from "../util/noteActions";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

interface Props {
  noteData: Note
  onTransformEnd: (e: KonvaEventObject<DragEvent>) => void;
  nodeMap: RefObject<Map<string, Konva.Node>>;
}

const NoteShape = ({ noteData, onTransformEnd, nodeMap }: Props) => {
  const updateNote = useNoteStore((n) => n.updateNote)
  const deleteNode = useNoteStore((n) => n.deleteNote)
  const ws = useWsStore(ws => ws.ws)
  const lastSentRef = useRef(0)


  function sendUpdateToWs(message: { action: string, id: string, changes: Partial<Note> }) {
    if (!ws) return
    ws?.send(JSON.stringify(message))
  }

  return (
    <>
      <Group
        id={noteData.id}
        x={noteData.x}
        y={noteData.y}
        name="note"
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
        onTransformEnd={onTransformEnd}
        ref={node => {
          if (node) {
            nodeMap.current.set(noteData.id, node)
          }
        }}
      >
        <Rect
          id={noteData.id}
          name="note"
          width={noteData.width}
          height={noteData.height}
          fill="red"
          shadowBlur={10}
        />
        <Text
          id={noteData.id}
          name="note"
          x={noteData.font_size / 2}
          y={noteData.font_size / 2}
          text={noteData.text}
          fontSize={noteData.font_size}
          width={noteData.width - noteData.font_size / 2}
          height={noteData.height - noteData.font_size / 2}
          listening={false}
        />
      </Group>
    </>
  )
}

export default NoteShape
