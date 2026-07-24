"use client"
import { Rect, Stage, Layer } from "react-konva";
import { Note, useNoteStore } from "../store/useNoteStore";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useEffectEvent, useState } from "react";
import NoteShape from "./NoteShape";
import { useWsStore } from "../store/useWsStore";

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

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight })

    async function NotesData() {
      const supabase = await createClient();

      let query = supabase.from("Notes").select("id, x, y, width, height, text, room_id")

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

  return (
    <Stage
      width={size.width}
      height={size.height}
    >
      <Layer>
        {Object.values(notes).map((note) => (
          <NoteShape
            key={note.id}
            noteData={note}
          />
        ))}
      </Layer>
    </Stage>
  )
}

export default Canvas
