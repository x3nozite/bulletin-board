import { create } from "zustand"

export type Profile = {
  id: string,
  name: string,
  avatarUrl: string,
  active: boolean
}

type PresenceStore = {
  profiles: Record<string, Profile>,
  addProfile: (profile: Profile) => void,
  disableProfile: (id: string) => void
  reactivateProfile: (id: string) => void
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  profiles: {},
  addProfile: (profile: Profile) => {
    set((state) => ({
      profiles: { ...state.profiles, [profile.id]: profile }
    }))
  },
  disableProfile: (id: string) => {
    set((state) => ({
      profiles: { ...state.profiles, [id]: { ...state.profiles[id], active: false } }
    }))
  },
  reactivateProfile: (id: string) => {
    set((state) => ({
      profiles: { ...state.profiles, [id]: { ...state.profiles[id], active: true } }
    }))
  }
}))
