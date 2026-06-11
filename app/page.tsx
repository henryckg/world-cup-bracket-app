import { getMatches, getLeaderboard } from "./actions/quiniela"
import { QuinielaApp } from "@/components/quiniela-app"
import { Toaster } from "@/components/ui/sonner"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [matches, leaderboard] = await Promise.all([getMatches(), getLeaderboard()])

  return (
    <main className="min-h-dvh">
      <QuinielaApp matches={matches} leaderboard={leaderboard} />
      <Toaster position="top-center" richColors theme="dark" />
    </main>
  )
}
