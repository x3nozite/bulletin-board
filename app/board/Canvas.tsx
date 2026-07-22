"use client"
import { Rect, Stage, Layer } from "react-konva";
import { Note, useNoteStore } from "../store/useNoteStore";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useEffectEvent, useState } from "react";
import NoteShape from "./NoteShape";
import { useWsStore } from "../store/useWsStore";

async function NotesData() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("Notes").select("id, x, y, width, height, text")

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


const Canvas = () => {
  const notes = useNoteStore((n) => n.notes)
  const addNote = useNoteStore(n => n.addNote)
  const updateNote = useNoteStore(n => n.updateNote)
  const deleteNode = useNoteStore(n => n.deleteNote)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const ws = useWsStore(ws => ws.ws)
  const connectWs = useWsStore(ws => ws.connect)

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight })
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
    connectWs(handleWs)
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
