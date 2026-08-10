"use client"
import { Rect, Stage, Layer, Transformer } from "react-konva";
import { Note, useNoteStore } from "../store/useNoteStore";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import NoteShape from "./NoteShape";
import { useWsStore } from "../store/useWsStore";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { updateNoteToDB } from "../util/noteActions";
import { CornerRightDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AppDialog from "../components/AppDialog";
import { randomUUID } from "crypto";

interface Props {
  roomId: string | null
}

const Canvas = ({ roomId }: Props) => {
  const notes = useNoteStore((n) => n.notes)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const ws = useWsStore(ws => ws.ws)
  const connectWs = useWsStore(ws => ws.connect)
  const [userId, setUserId] = useState<string>("")

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  })
  const isSelecting = useRef(false)
  const transformerRef = useRef<Konva.Transformer>(null)
  const noteRefs = useRef(new Map())

  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [text, setText] = useState<string>("")

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight })

    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUserId(crypto.randomUUID())
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)

  }, [])

  useEffect(() => {
    connectWs(roomId)
    return () => {
      if (ws?.readyState === WebSocket.CONNECTING) {
        ws.close()
      } else {
        close()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      const nodes = selectedIds
        .map(id => noteRefs.current.get(id))
        .filter(node => node)

      transformerRef.current.nodes(nodes)
      transformerRef.current.getLayer()?.batchDraw()
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedIds, notes])

  function handleStageClick(e: KonvaEventObject<MouseEvent>) {
    const selWidth = Math.abs(selectionRectangle.x2 - selectionRectangle.x1)
    const selHeight = Math.abs(selectionRectangle.y2 - selectionRectangle.y1)
    if (selectionRectangle.visible && selWidth > 0 && selHeight > 0) return

    if (e.target === e.target.getStage()) {
      setSelectedIds([])
      return
    }

    if (!e.target.hasName("note")) return

    const clickedId = e.target.id()

    setSelectedIds([clickedId])
  }

  function handleTransformEnd(e: KonvaEventObject<DragEvent>) {
    const id = e.target.id()
    const node = e.target
    const note = notes[id]
    const changes: Partial<Note> = {
      x: node.x(),
      y: node.y(),
      width: note.width * node.scaleX(),
      height: note.height * node.scaleY(),
      font_size: note.font_size * node.scaleX()
    }
    node.scaleX(1)
    node.scaleY(1)

    updateNoteToDB(id, changes)
  }

  function onHoldClick(note: Note) {
    setEditingNote(note)
    setText(note.text)
  }

  function handleSave() {
    if (!editingNote) return
    updateNoteToDB(editingNote.id, { text: text })
    setEditingNote(null)
  }

  return (
    <>
      <Stage
        width={size.width}
        height={size.height}
        onClick={handleStageClick}
      >
        <Layer>
          {Object.values(notes).map((note) => (
            <NoteShape
              key={note.id}
              noteData={note}
              onTransformEnd={handleTransformEnd}
              nodeMap={noteRefs}
              onHoldClick={onHoldClick}
              userId={userId}
            />
          ))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox
              }
              return newBox
            }}
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            rotateEnabled={false}
          />
          {selectionRectangle.visible && (
            <Rect
              x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
              y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
              width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
              height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
              fill="rgba(0,0,255,0.5)"
            />
          )}
        </Layer>
      </Stage>
      <AppDialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        title="Edit note"
      >
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        <Button onClick={handleSave}>Save</Button>
      </AppDialog>
    </>
  )
}

export default Canvas
