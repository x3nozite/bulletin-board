import { createClient } from "@/lib/supabase/client";
import { Profile, usePresenceStore } from "../store/usePresenceStore";

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
    active: true
  }

  usePresenceStore.getState().addProfile(newProfile)
}
