import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold text-amber-900 text-balance">Welcome to Grandmob</h1>
        <p className="text-xl text-amber-800 text-pretty leading-relaxed">
          Your private family social network. Share moments, stories, and stay connected with the people who matter
          most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              size="lg"
              variant="outline"
              className="border-amber-600 text-amber-900 hover:bg-amber-100 text-lg px-8 bg-transparent"
            >
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
