"use client"
import { Rect, Stage, Layer } from "react-konva";
import { Note, useNoteStore } from "../store/useNoteStore";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useEffectEvent, useState } from "react";
import NoteShape from "./NoteShape";

async function NotesData() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("Notes").select("id, x, y, width, height, text")

  const notesRecord = notes?.reduce((acc, note) => {
    acc[note.id] = note;
    return acc;
  }, {} as Record<string, Note>);
  useNoteStore.setState({ notes: notesRecord })
}

const Canvas = () => {
  const notes = useNoteStore((n) => n.notes)
  const [size, setSize] = useState({ width: 0, height: 0 })

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
