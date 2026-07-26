"use client"
import { AddItemBox } from "../components/AddItemBox"
import Canvas from "./Canvas"
import { LogoutButton } from "../components/logoutButton"
import { Note, useNoteStore } from "../store/useNoteStore"
import { createClient } from "@/lib/supabase/client"
import { useWsStore } from "../store/useWsStore"
import InvitePopup from "../components/popup"

interface Props {
  roomId: string | null
}

async function saveNote(newNote: Note) {
  const supabase = await createClient()
  const { error } = await supabase.from("Notes").insert(newNote)

  if (error) console.error(error);

}

export default function Board({ roomId }: Props) {
  const addNote = useNoteStore(n => n.addNote)
  const ws = useWsStore(ws => ws.ws)

  const addNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      x: 50, y: 50,
      width: 150, height: 150,
      text: "new note",
      room_id: roomId,
    }
    addNote(newNote)
    saveNote(newNote)

    const message = {
      action: "create",
      note: newNote
    }

    ws?.send(JSON.stringify(message))
  }
  return (
    <>
      <div className="border-2 border-solid border-gray-500 flex justify-center w-fit p-4 fixed mx-auto top-4 inset-x-0 z-10">
        <AddItemBox
          buttonOnClick={addNewNote}
        />
        <LogoutButton></LogoutButton>
        {roomId && InvitePopup({ roomId })}
      </div>

      <div className="bg-white">
        <Canvas roomId={roomId}></Canvas>
      </div>

    </>
  )
}
