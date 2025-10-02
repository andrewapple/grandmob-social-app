import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-md">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-amber-900">Check Your Email</CardTitle>
            <CardDescription className="text-amber-700">We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-800 text-center">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you can
              log in to Grandmob.
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
