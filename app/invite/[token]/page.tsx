import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    token: string;
  }>
}

export default async function InvitePage({ params }: Props) {
  const p = await params
  const supabase = createClient()

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

  redirect(`/board/${invite?.room_id}`)
}

