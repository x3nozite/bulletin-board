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
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "../components/ConnectionStatus"
import { useRouter } from "next/navigation"

interface Props {
  roomId: string | null
}

export default function Board({ roomId }: Props) {
  const undo = useUndoRedoStore(ur => ur.undo)
  const redo = useUndoRedoStore(ur => ur.redo)
  const router = useRouter()

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
      <div className="fixed top-0 inset-x-0 z-10 flex-row gap-20">
        <div className="grid grid-cols-3 items-center px-6 py-3">
          <div className="justify-self-start">
            {/* board name / logo slot */}
          </div>

          <div className="justify-self-center">
            <div className="flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-200 px-2 py-1.5">
              <AddItemBox buttonOnClick={() => addNewNote(roomId)} />
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {roomId && InvitePopup({ roomId })}
            </div>
          </div>

          <div className="justify-self-end flex items-center gap-2">
            <Button onClick={() => router.push("/files")}>
              Files
            </Button>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-4 mx-4">
          <PresenceIndicator></PresenceIndicator>
        </div>
      </div>

      <div className="">
        <Canvas roomId={roomId}></Canvas>
      </div>
      <ConnectionStatus></ConnectionStatus>

    </>
  )
}
