"use client"

import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const SignupForm = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.SubmitEvent) {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Password do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/board`
        },
      })
      if (error) throw error
      router.push("/board")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occured")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-mono h-full">
      <Card className="h-full rounded-2xl flex justify-center p-4 gap-12">
        <CardHeader>
          <CardTitle className="text-6xl">Sign Up</CardTitle>
          <CardDescription className="text-base">Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-8">
              <div className="grid gap-4">
                <Label htmlFor="email" className="text-xl">Email</Label>
                <Input
                  className="h-16 text-base!"
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <Label htmlFor="password" className="text-xl">Password</Label>
                <Input
                  className="h-16 text-base!"
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <Label htmlFor="repeat-password" className="text-xl">Repeat Password</Label>
                <Input
                  className="h-16 text-base!"
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4"
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupForm
