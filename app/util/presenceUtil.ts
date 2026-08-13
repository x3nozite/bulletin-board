import { createClient } from "@/lib/supabase/client";
import { Profile, usePresenceStore } from "../store/usePresenceStore";

function assignColorForUser(userId: string) {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"]

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 4) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export async function fetchProfile(clientId: string) {
  const cached = usePresenceStore.getState().profiles[clientId]

  if (cached) {
    usePresenceStore.getState().reactivateProfile(clientId)
    return
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("Profiles")
    .select("id, avatar_url, name")
    .eq("id", clientId)
    .maybeSingle()

  if (error || !data) {
    console.error();
    return
  }

  const { data: user, error: getUserError } = await supabase.auth.getUser()
  if (!user || getUserError) {
    console.error();
    return
  }

  if (user.user.id == data.id) {
    return
  }

  const newProfile: Profile = {
    id: clientId,
    name: data.name,
    avatarUrl: data.avatar_url,
    active: true,
    color: assignColorForUser(clientId)
  }

  usePresenceStore.getState().addProfile(newProfile)
}
