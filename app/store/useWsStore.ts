import { create } from "zustand"
import { useNoteStore } from "./useNoteStore";

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;
const MULTIPLIER = 2;
const JITTER = 0.1

type WsStore = {
  ws: WebSocket | null;
  shouldReconnect: boolean;
  currentDelay: number;
  reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  connect: (roomId: string | null) => void;
  disconnect: () => void
  scheduleReconnect: (roomId: string | null) => void
}

export const useWsStore = create<WsStore>((set, get) => ({
  ws: null,
  shouldReconnect: true,
  currentDelay: INITIAL_DELAY,
  reconnectTimer: undefined,
  connect: (roomId: string | null) => {
    if (get().ws) return;
    const ws = new WebSocket(`ws://localhost:8888/ws?room=${roomId}`)

    ws.onopen = () => {
      console.log("Connection established")
      set({ currentDelay: INITIAL_DELAY })
      set({ shouldReconnect: true })
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
      }
    }

    ws.onmessage = (e) => wsHandler(e)

    ws.onclose = () => {
      console.log("connection lost")
      if (get().shouldReconnect) get().scheduleReconnect(roomId)
    }
    set({ ws })
  },
  disconnect: () => {
    set({ shouldReconnect: false })
    if (get().reconnectTimer) clearTimeout(get().reconnectTimer)
    if (get().ws) get().ws?.close(1000, "Client closing")
  },
  scheduleReconnect: (roomId) => {
    console.log("reconnecting...", roomId)
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
}))
