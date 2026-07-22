import { create } from "zustand"

export type Room = {
  id: string;
  owner_id: string;
  name: string;
  updated_at: Date | null
}

type RoomStore = {
  rooms: Room[];
  addRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  addRoom: (room) =>
    set((state) => ({
      rooms: { ...state.rooms, room }
    })),
  deleteRoom: (id) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id)
    })),
}))
