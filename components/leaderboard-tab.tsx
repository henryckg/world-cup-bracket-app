"use client"

import type { LeaderboardRow } from "@/app/actions/quiniela"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  leaderboard: LeaderboardRow[]
  currentPlayerId: number
}

export function LeaderboardTab({ leaderboard, currentPlayerId }: Props) {
  if (leaderboard.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <Trophy className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium text-foreground">Aún no hay jugadores</p>
        <p className="text-sm text-muted-foreground">Sé el primero en hacer tus predicciones.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <Trophy className="h-5 w-5 text-accent" aria-hidden="true" />
          Tabla de posiciones
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Marcador exacto = 3 pts · acertar ganador/empate = 1 pt
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {leaderboard.map((row, i) => {
          const rank = i + 1
          const isMe = row.playerId === currentPlayerId
          return (
            <div
              key={row.playerId}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                isMe ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  rank === 1
                    ? "bg-accent text-accent-foreground"
                    : rank === 2
                      ? "bg-secondary text-secondary-foreground"
                      : rank === 3
                        ? "bg-muted text-foreground"
                        : "bg-muted/60 text-muted-foreground",
                )}
              >
                {rank === 1 ? <Crown className="h-4 w-4" aria-hidden="true" /> : rank}
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold text-foreground">
                  {row.name}
                  {isMe && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Tú
                    </Badge>
                  )}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" aria-hidden="true" />
                  {row.exact} exactos · {row.predictionsMade} predicciones
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {row.points}
                </p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
