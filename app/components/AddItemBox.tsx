"use client"

import { createClient } from "@/lib/supabase/client";
import { useNoteStore, Note } from "../store/useNoteStore";
import { useEffect, useRef } from "react";

async function saveNote(newNote: Note) {
  const supabase = await createClient()
  const { error } = await supabase.from("Notes").insert(newNote)

  if (error) console.error(error);

}

export function AddItemBox() {
  const addNote = useNoteStore(n => n.addNote)
  const wsRef = useRef<WebSocket | null>(null);

  const addNewNote = (originalMsg: boolean = true) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      x: 50, y: 50,
      width: 150, height: 150,
      text: "new note"
    }
    addNote(newNote)
    saveNote(newNote)

    const message = {
      action: "create",
      note: newNote
    }

    if (originalMsg) wsRef.current?.send(JSON.stringify(message))
  }

  const handleWs = (e: MessageEvent) => {
    if (!e.data) return
    const data = JSON.parse(e.data)
    const action = data.body.action

    if (action === "create") {
      console.log("create new note")
      addNote(data.body.note)
    }
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8888/ws")
    wsRef.current = ws

    ws.onopen = () => console.log("connected")
    ws.onmessage = (e) => handleWs(e)

    return () => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      } else {
        close()
      }
    }
  }, [])

  return (
    <button
      onClick={() => addNewNote()}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10  text-muted-foreground transition-all hover:border-foreground hover:bg-muted/20 hover:text-foreground group cursor-pointer"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
    </button>
  );
}
