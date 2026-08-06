"use client"
import { AddItemBox } from "../components/AddItemBox"
import Canvas from "./Canvas"
import { LogoutButton } from "../components/logoutButton"
import { Note, useNoteStore } from "../store/useNoteStore"
import { createClient } from "@/lib/supabase/client"
import { useWsStore } from "../store/useWsStore"
import InvitePopup from "../components/popup"
import { addNewNote } from "../util/noteActions"
import { useUndoRedoStore } from "../store/useUndoRedoStore"
import { useEffect } from "react"
import { PresenceIndicator } from "./PresenceIndicator"
import { ConnectionStatus } from "../components/ConnectionStatus"

interface Props {
  roomId: string | null
}

export default function Board({ roomId }: Props) {
  const undo = useUndoRedoStore(ur => ur.undo)
  const redo = useUndoRedoStore(ur => ur.undo)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {

      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "z") {
        undo()
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        redo()
        return;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  })

  return (
    <>
      <div>
        <div className="border-2 border-solid border-gray-500 flex justify-center w-fit p-4 fixed mx-auto top-4 inset-x-0 z-10">
          <AddItemBox
            buttonOnClick={() => addNewNote(roomId)}
          />
          <LogoutButton></LogoutButton>
          {roomId && InvitePopup({ roomId })}
        </div>
        <div>
          <PresenceIndicator></PresenceIndicator>
        </div>
      </div>

      <div className="bg-white">
        <Canvas roomId={roomId}></Canvas>
      </div>
      <ConnectionStatus></ConnectionStatus>

    </>
  )
}
