import { createClient } from "@/lib/supabase/server";
import Board from "../Board"
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    roomId: string;
  }>
}

export default async function Page({ params }: Props) {
  const p = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: room } = await supabase
    .from("Rooms")
    .select("owner_id")
    .eq("id", p.roomId)
    .maybeSingle()

  const isOwner = room?.owner_id === user.id ? true : false
  if (isOwner) console.log("is owner")

  const { data: roomAccess } = await supabase
    .from("RoomAccess")
    .select()
    .eq("user_id", user.id)
    .eq("room_id", p.roomId)
    .maybeSingle()

  if (roomAccess) console.log("have access")

  if (!roomAccess && !isOwner) {
    return <div>You do not have access to this page</div>
  }

  return (
    <Board roomId={p.roomId}></Board>
  )
}

