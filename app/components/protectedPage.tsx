import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  children: React.ReactNode
}

export default async function ProtectedPage({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims()

  if (!data) {
    redirect("/auth/login")
  }

  return (
    <div>{children}</div>
  );
}
