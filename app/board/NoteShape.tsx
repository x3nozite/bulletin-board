import { createClient } from "@/lib/supabase/client";
import { Note, useNoteStore } from "../store/useNoteStore"
import { Rect, Text, Group } from "react-konva";
import { RefObject, useEffect, useRef, useState } from "react";
import { useWsStore } from "../store/useWsStore";
import { deleteNoteInDB, updateNoteToDB } from "../util/noteActions";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { useNoteLockStore } from "../store/useNoteLockStore";
import { Jersey_20 } from "next/font/google";
import { usePresenceStore } from "../store/usePresenceStore";

interface Props {
  noteData: Note
  onTransformEnd: (e: KonvaEventObject<DragEvent>) => void;
  nodeMap: RefObject<Map<string, Konva.Node>>;
  onHoldClick: (note: Note) => void;
  userId: string;
}

const NoteShape = ({ noteData, onTransformEnd, nodeMap, onHoldClick, userId }: Props) => {
  const updateNote = useNoteStore((n) => n.updateNote)
  const deleteNode = useNoteStore((n) => n.deleteNote)
  const ws = useWsStore(ws => ws.ws)
  const lastSentRef = useRef(0)
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [isHolding, setIsHolding] = useState(false)
  const lockedNotes = useNoteLockStore(n => n.lockedNotes)
  const lock = useNoteLockStore(n => n.lock)
  const unlock = useNoteLockStore(n => n.unlock)

  const editorId = useNoteLockStore(n => n.lockedNotes[noteData.id])
  const editorProfile = usePresenceStore(p => (editorId ? p.profiles[editorId] : undefined))
  const borderWidth = 3

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
        onDragEnd={(e) => {
          updateNoteToDB(noteData.id, { x: e.target.x(), y: e.target.y() })
          unlock(noteData.id)
        }}
        onDblClick={() => {
          onHoldClick(noteData)
        }}
        onMouseDown={() => {
          holdTimer.current = setTimeout(() => {
            deleteNoteInDB(noteData.id)
          }, 500)
        }}
        onDragStart={() => {
          clearTimeout(holdTimer.current)
          lock(noteData.id, userId)
        }}
        onMouseUp={() => {
          clearTimeout(holdTimer.current)
        }}
        onMouseLeave={() => {
          clearTimeout(holdTimer.current)
        }}
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
          stroke={editorProfile?.color ?? "black"}
          strokeWidth={lockedNotes[noteData.id] ? (lockedNotes[noteData.id] === userId ? 0 : borderWidth) : 0}
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
        {editorProfile && (
          <>
            <Rect
              y={-20}
              height={20}
              width={100}
              fill={editorProfile.color ?? "black"}
            />
            <Text
              y={-20}
              x={5}
              height={20}
              width={100}
              fontSize={noteData.font_size}
              fill="black"
              text={editorProfile.name ?? "unkown"}
            />
          </>
        )}
      </Group>
    </>
  )
}

export default NoteShape
