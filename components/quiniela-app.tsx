"use client"

import { useEffect, useState, useTransition } from "react"
import type { Match, Player, Prediction } from "@/lib/db/schema"
import type { LeaderboardRow } from "@/app/actions/quiniela"
import { joinGame, getPredictionsForPlayer, getPlayerByName } from "@/app/actions/quiniela"
import { JoinScreen } from "@/components/join-screen"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PredictionsTab } from "@/components/predictions-tab"
import { LeaderboardTab } from "@/components/leaderboard-tab"
import { LiveTab } from "@/components/live-tab"
import { ResultsTab } from "@/components/results-tab"
import { Trophy, Pencil, Radio, ClipboardCheck, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const STORAGE_KEY = "quiniela:currentPlayer"

type Props = {
  matches: Match[]
  leaderboard: LeaderboardRow[]
}

export function QuinielaApp({ matches, leaderboard }: Props) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loadingSession, setLoadingSession] = useState(true)
  const [, startTransition] = useTransition()

  // Restore session from localStorage (just the name; data lives in the DB).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!saved) {
      setLoadingSession(false)
      return
    }
    startTransition(async () => {
      const existing = await getPlayerByName(saved)
      if (existing) {
        setPlayer(existing)
        const preds = await getPredictionsForPlayer(existing.id)
        setPredictions(preds)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      setLoadingSession(false)
    })
  }, [])

  async function handleJoin(name: string) {
    const p = await joinGame(name)
    localStorage.setItem(STORAGE_KEY, p.name)
    setPlayer(p)
    const preds = await getPredictionsForPlayer(p.id)
    setPredictions(preds)
    toast.success(`¡Bienvenido, ${p.name}!`)
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setPlayer(null)
    setPredictions([])
  }

  function handlePredictionSaved(updated: Prediction) {
    setPredictions((prev) => {
      const idx = prev.findIndex((p) => p.matchId === updated.matchId)
      if (idx === -1) return [...prev, updated]
      const copy = [...prev]
      copy[idx] = updated
      return copy
    })
  }

  if (loadingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (!player) {
    return <JoinScreen onJoin={handleJoin} />
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
              Quiniela Mundial 2026
            </h1>
            <p className="text-sm text-muted-foreground">
              Jugando como <span className="font-semibold text-accent">{player.name}</span>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Salir</span>
        </Button>
      </header>

      <Tabs defaultValue="predicciones" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predicciones" className="gap-1.5">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Predicciones</span>
          </TabsTrigger>
          <TabsTrigger value="tabla" className="gap-1.5">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tabla</span>
          </TabsTrigger>
          <TabsTrigger value="hoy" className="gap-1.5">
            <Radio className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Hoy</span>
          </TabsTrigger>
          <TabsTrigger value="resultados" className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Resultados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predicciones" className="mt-4">
          <PredictionsTab
            player={player}
            matches={matches}
            predictions={predictions}
            onSaved={handlePredictionSaved}
          />
        </TabsContent>

        <TabsContent value="tabla" className="mt-4">
          <LeaderboardTab leaderboard={leaderboard} currentPlayerId={player.id} />
        </TabsContent>

        <TabsContent value="hoy" className="mt-4">
          <LiveTab />
        </TabsContent>

        <TabsContent value="resultados" className="mt-4">
          <ResultsTab matches={matches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
