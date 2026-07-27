import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    token: string;
  }>
}

export default async function InvitePage({ params }: Props) {
  const p = await params
  const supabase = await createClient()

  const { data: invite, error: error } = await supabase
    .from("RoomInvites")
    .select("room_id, expires_at")
    .eq("token", p.token)
    .maybeSingle()

  if (error) {
    console.error(error.message)
    console.log(error)
  }

  if (!invite || new Date(invite.expires_at) < new Date()) {
    return (
      <div>Invalid invite</div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login`)
  }

  // create room access

  const { data: room } = await supabase
    .from("Rooms")
    .select("owner_id")
    .eq("id", invite.room_id)
    .maybeSingle()

  if (room?.owner_id !== user.id) {
    const newRoomAccess = {
      room_id: invite.room_id,
      user_id: user.id
    }
    await supabase
      .from("RoomAccess")
      .upsert(newRoomAccess, { onConflict: "room_id,user_id" })
  }


  redirect(`/board/${invite?.room_id}`)
}

