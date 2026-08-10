import { create } from "zustand"
import { useNoteStore } from "./useNoteStore";
import { refecthNotesData } from "../util/noteActions";
import { createClient } from "@/lib/supabase/client";
import { usePresenceStore } from "./usePresenceStore";
import { fetchProfile } from "../util/presenceUtil";
import { useNoteLockStore } from "./useNoteLockStore";

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;
const MULTIPLIER = 2;
const JITTER = 0.1

type ConnectionStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED"

type WsStore = {
  ws: WebSocket | null;
  shouldReconnect: boolean;
  currentDelay: number;
  reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  status: ConnectionStatus
  connect: (roomId: string | null) => void;
  disconnect: () => void;
  scheduleReconnect: (roomId: string | null) => void;
  sendMessage: (msg: string) => void;
}

export const useWsStore = create<WsStore>((set, get) => ({
  ws: null,
  shouldReconnect: true,
  currentDelay: INITIAL_DELAY,
  reconnectTimer: undefined,
  status: "DISCONNECTED",
  connect: async (roomId: string | null) => {
    set({ status: "CONNECTING" })
    if (get().ws) return;

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const ws = new WebSocket(`ws://localhost:8888/ws?room=${roomId}&token=${token}`)

    ws.onopen = () => {
      console.log("Connection established")
      set({ status: "CONNECTED" })
      set({ currentDelay: INITIAL_DELAY })
      set({ shouldReconnect: true })
      refecthNotesData(roomId)
    }

    const wsHandler = (e: MessageEvent) => {
      if (!e.data) return
      const data = JSON.parse(e.data)
      const action = data.body.action

      if (action === "create") {
        useNoteStore.getState().addNote(data.body.note)
      } else if (action === "update") {
        useNoteStore.getState().updateNote(data.body.id, data.body.changes)
      } else if (action === "delete") {
        useNoteStore.getState().deleteNote(data.body.id)
      } else if (action === "join") {
        console.log("update presence")
        const clientId = data.body.clientId
        fetchProfile(clientId)
      } else if (action === "leave") {
        const clientId = data.body.clientId
        usePresenceStore.getState().disableProfile(clientId)
      } else if (action === "lock") {
        useNoteLockStore.getState().lock(data.body.note, data.body.editor, false)
      } else if (action === "unlock") {
        useNoteLockStore.getState().unlock(data.body.note, false)
      }
    }

    ws.onmessage = (e) => wsHandler(e)

    ws.onclose = () => {
      console.log("connection lost")
      set({ ws: null })
      if (get().shouldReconnect) get().scheduleReconnect(roomId)
      else set({ status: "DISCONNECTED" })
    }
    set({ ws })
  },
  disconnect: () => {
    set({ shouldReconnect: false })
    set({ status: "DISCONNECTED" })
    if (get().reconnectTimer) clearTimeout(get().reconnectTimer)
    if (get().ws) get().ws?.close(1000, "Client closing")
  },
  scheduleReconnect: (roomId) => {
    const jitterRange = get().currentDelay * JITTER
    const jitterValue = Math.random() * jitterRange - (jitterRange / 2)
    const delay = Math.round(get().currentDelay + jitterValue)
    console.log(delay)

    set({
      reconnectTimer: setTimeout(() => {
        console.log("reconnection done")
        get().connect(roomId)
      }, delay)
    })

    set({ currentDelay: Math.min(get().currentDelay * MULTIPLIER, MAX_DELAY) })
  },
  sendMessage: (msg) => {
    if (!get().ws || get().ws?.readyState !== WebSocket.OPEN) return

    get().ws?.send(msg)
  }
}))
