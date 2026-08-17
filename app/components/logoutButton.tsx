"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    // 1. Clear session from Supabase
    await supabase.auth.signOut()

    // 2. Refresh router & redirect user to login page
    router.push("auth/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
    >
      Log Out
    </button>
  )
}
