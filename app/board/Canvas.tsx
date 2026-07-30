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

interface Props {
  roomId: string | null
}

const Canvas = ({ roomId }: Props) => {
  const notes = useNoteStore((n) => n.notes)
  const addNote = useNoteStore(n => n.addNote)
  const updateNote = useNoteStore(n => n.updateNote)
  const deleteNode = useNoteStore(n => n.deleteNote)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const ws = useWsStore(ws => ws.ws)
  const connectWs = useWsStore(ws => ws.connect)

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

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight })

    async function NotesData() {
      const supabase = await createClient();

      let query = supabase.from("Notes").select("id, x, y, width, height, text, room_id, scale_x, scale_y, font_size")

      query = (roomId) ? query.eq("room_id", roomId) : query.is("room_id", null)

      const { data: notes } = await query

      if (!notes) {
        console.error("Failed retrieving data!")
        return
      }

      const notesRecord = notes?.reduce((acc, note) => {
        acc[note.id] = note;
        return acc;
      }, {} as Record<string, Note>);
      useNoteStore.setState({ notes: notesRecord })
    }
    NotesData()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)

  }, [])

  const handleWs = (e: MessageEvent) => {
    if (!e.data) return
    const data = JSON.parse(e.data)
    const action = data.body.action

    if (action === "create") {
      console.log("create new note")
      addNote(data.body.note)
    } else if (action === "update") {
      updateNote(data.body.id, data.body.changes)
    } else if (action === "delete") {
      deleteNode(data.body.id)
    }
  }

  useEffect(() => {
    connectWs(handleWs, roomId)
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
    console.log(e.target.name())
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
    console.log(node.scaleX())
    console.log(note.width)
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

  return (
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
  )
}

export default Canvas
