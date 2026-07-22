"use client"
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { AddItemBox } from "../components/AddItemBox";
import { Room, useRoomStore } from "../store/useRoomStore";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

async function saveRoom(newRoom: Room) {
  const supabase = await createClient()
  const { error } = await supabase.from("Rooms").insert(newRoom)

  if (error) console.error(error);

}

export default function RoomList() {
  const rooms = useRoomStore(r => r.rooms)
  const addRoom = useRoomStore(r => r.addRoom)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    getUser()
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
        this is for all the rooms the user have access to
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
      </div>
    </div>
  );
}
