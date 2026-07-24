import { create } from "zustand"

type WsStore = {
  ws: WebSocket | null;
  connect: (handleWs: (e: MessageEvent) => void, roomId: string | null) => void;
}

export const useWsStore = create<WsStore>((set, get) => ({
  ws: null,
  connect: (handleWs: (e: MessageEvent) => void, roomId: string | null) => {
    if (get().ws) return;
    const ws = new WebSocket(`ws://localhost:8888/ws?room=${roomId}`)
    ws.onopen = () => console.log("WebSocket Connected")
    ws.onmessage = (e) => handleWs(e)
    set({ ws })
  },
}))
