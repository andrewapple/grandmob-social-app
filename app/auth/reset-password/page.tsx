"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // The callback route will handle the code exchange and then redirect to update-password
      const redirectBase = (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin).replace(
        /\/$/,
        "",
      )
      const redirectTo = `${redirectBase}/auth/callback`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-md">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-amber-900">Reset Password</CardTitle>
            <CardDescription className="text-amber-700">Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <p className="text-sm text-green-700 bg-green-50 p-4 rounded-md">
                  Check your email for a password reset link.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">Back to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-amber-700">
                  <Link
                    href="/auth/login"
                    className="font-medium text-amber-900 underline underline-offset-4 hover:text-amber-800"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
