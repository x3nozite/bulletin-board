"use client"

import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link";

const LoginForm = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>("")
  const [isLoading, setIsLoading] = useState(false)

  function handleLogin() {
    console.log("login")
    setIsLoading(true)
  }

  return (
    <div className="font-mono h-full">
      <Card className="h-full rounded-2xl flex justify-center p-4 gap-12">
        <CardHeader>
          <CardTitle className="text-6xl">Login</CardTitle>
          <CardDescription className="text-base">Enter your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
