import { create } from "zustand"
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type UserStore = {
  user: User | undefined;
  getUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  getUser: () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()


  },
}))
