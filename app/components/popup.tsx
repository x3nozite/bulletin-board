import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface Props {
  roomId: string
}

const InvitePopup = ({ roomId }: Props) => {
  const [inviteLink, setInviteLink] = useState("")
  const [loading, setLoading] = useState(false)

  async function createInvite() {
    setLoading(true)
    const supabase = createClient()
    const { data: existingInvite } = await supabase.from("RoomInvites").select("token").eq("room_id", roomId).gt("expires_at", new Date().toISOString()).maybeSingle()

    if (existingInvite) {
      setInviteLink(`${window.location.origin}/invite/${existingInvite.token}`)
      setLoading(false)
      return
    }

    const token = crypto.randomUUID()
    const { error } = await supabase.from("RoomInvites").insert({ room_id: roomId, token: token })

    if (error) {
      console.error(error);
      return
    }
    setInviteLink(`${window.location.origin}/invite/${token}`)
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "default" })} onClick={createInvite}>
        Invite Others
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
        </DialogHeader>
        <input readOnly value={loading ? "Loading..." : inviteLink} />
        <Button onClick={() => navigator.clipboard.writeText(inviteLink)}>Copy</Button>
      </DialogContent>
    </Dialog>
  )
}

export default InvitePopup
