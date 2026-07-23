"use client"
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { AddItemBox } from "../components/AddItemBox";
import { Room, useRoomStore } from "../store/useRoomStore";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link"

async function saveRoom(newRoom: Room) {
  const supabase = createClient()
  const { error } = await supabase.from("Rooms").insert(newRoom)

  if (error) console.error(error);

}

async function roomsData() {
  const supabase = createClient()
  const { data: rooms } = await supabase.from("Rooms").select("id, owner_id, name, updated_at")

  if (!rooms) {
    console.error("Failed retrieving rooms")
    return
  }

  useRoomStore.setState({ rooms: rooms })
}

export default function RoomList() {
  const supabase = createClient();
  const rooms = useRoomStore(r => r.rooms)
  const addRoom = useRoomStore(r => r.addRoom)
  const deleteRoom = useRoomStore(r => r.deleteRoom)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    getUser()
    roomsData()
  }, [])

  function createNewRoom() {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      owner_id: currentUser ? currentUser.id : "",
      name: "placeholder",
      updated_at: null
    }

    addRoom(newRoom)
    saveRoom(newRoom)
    console.log("addnewroom")
  }

  async function deleteRoomFromDB(id: string) {
    deleteRoom(id)

    const response = await supabase.from("Rooms").delete().eq("id", id)
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div>
        <AddItemBox
          buttonOnClick={createNewRoom}
        />
      </div>
      <div>
        {rooms?.map((room) => (
          <div key={room.id}>
            <Link href={`/board/${room.id}`}>
              created by: {room.owner_id}. {room.id}
            </Link>
            <button onClick={() => { deleteRoomFromDB(room.id) }}>Delete room</button>
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
      </div>
    </div>
  );
}
