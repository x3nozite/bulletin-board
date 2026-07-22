import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { AddItemBox } from "../components/AddItemBox";
import { useRoomStore } from "../store/useRoomStore";
import ProtectedPage from "../components/protectedPage";
import RoomList from "./roomList";


export default async function page() {
  return (
    <ProtectedPage>
      <RoomList></RoomList>
    </ProtectedPage>
  );
}
