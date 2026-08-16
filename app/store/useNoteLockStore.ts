import { create } from "zustand"
import { useWsStore } from "./useWsStore";

type NoteStore = {
  lockedNotes: Record<string, string>;
  lock: (noteId: string, editorId: string, rootCall?: boolean) => void;
  unlock: (noteId: string, rootCall?: boolean) => void
  unlockDisconnectedUser: (editorId: string) => void;
}

export const useNoteLockStore = create<NoteStore>((set, get) => ({
  lockedNotes: {},
  lock: (noteId, editorId, rootCall = true) => {
    set((state) => ({
      lockedNotes: { ...state.lockedNotes, [noteId]: editorId },
    }))

    if (!rootCall) return
    const msg = {
      action: "lock",
      note: noteId,
      editor: editorId
    }
    useWsStore.getState().sendMessage(JSON.stringify(msg))
  },
  unlock: (noteId, rootCall = true) =>
    set((state) => {
      const { [noteId]: _, ...rest } = state.lockedNotes
      if (rootCall) {
        const msg = {
          action: "unlock",
          note: noteId,
        }
        useWsStore.getState().sendMessage(JSON.stringify(msg))
      }
      return { lockedNotes: rest }
    }),
  unlockDisconnectedUser: (editorId) => {
    const locked = get().lockedNotes
    Object.entries(locked).forEach(([nId, eId]) => {
      if (eId === editorId) {
        get().unlock(nId)
      }
    })
  }
}))
