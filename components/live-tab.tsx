"use client"

import { useState } from "react"
import { fetchLiveScores, type LiveMatch } from "@/app/actions/ai-scores"
import { teamCode } from "@/lib/teams"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Radio, Info, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function LiveTab() {
  const [matches, setMatches] = useState<LiveMatch[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  async function handleRefresh() {
    setLoading(true)
    try {
      const { matches, checkedAt } = await fetchLiveScores()
      setMatches(matches)
      setCheckedAt(checkedAt)
      if (matches.length === 0) {
        toast.info("No hay partidos del Mundial hoy")
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Error al buscar marcadores")
    } finally {
      setLoading(false)
    }
  }

  const live = matches?.filter((m) => m.status === "live") ?? []
  const others = matches?.filter((m) => m.status !== "live") ?? []

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
              </span>
              Marcadores en vivo
            </h2>
            <p className="text-sm text-muted-foreground">Partidos del Mundial 2026 de hoy</p>
          </div>
          <Button onClick={handleRefresh} disabled={loading} size="sm">
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
              aria-hidden="true"
            />
            {loading ? "Buscando..." : "Actualizar"}
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-accent/15 p-3 text-sm text-foreground/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-pretty leading-relaxed">
            Los marcadores se buscan en internet en tiempo real, así que pueden tardar unos segundos
            en cargar y tener un pequeño retraso respecto al partido.
          </p>
        </div>

        {checkedAt && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Última actualización:{" "}
            {new Date(checkedAt).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        )}
      </Card>

      {matches === null && !loading && (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Radio className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium text-foreground">Toca &quot;Actualizar&quot;</p>
          <p className="text-sm text-muted-foreground">
            Buscaremos los partidos de hoy y sus marcadores en vivo.
          </p>
        </Card>
      )}

      {loading && matches === null && (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      )}

      {matches !== null && matches.length === 0 && !loading && (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Radio className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium text-foreground">No hay partidos hoy</p>
          <p className="text-sm text-muted-foreground">Vuelve un día de partido del Mundial.</p>
        </Card>
      )}

      {live.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-live">En juego ahora</h3>
          {live.map((m, i) => (
            <LiveCard key={`live-${i}`} match={m} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          {live.length > 0 && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Otros partidos de hoy
            </h3>
          )}
          {others.map((m, i) => (
            <LiveCard key={`other-${i}`} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function LiveCard({ match }: { match: LiveMatch }) {
  const isLive = match.status === "live"
  const isFinished = match.status === "finished"
  const showScore = match.homeScore !== null && match.awayScore !== null

  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        isLive && "border-live bg-live/10 ring-1 ring-live/40",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        {isLive ? (
          <Badge className="gap-1 border-transparent bg-live text-live-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live-foreground opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live-foreground" />
            </span>
            EN VIVO {match.minute ? `· ${match.minute}` : ""}
          </Badge>
        ) : isFinished ? (
          <Badge variant="outline" className="border-border text-muted-foreground">
            Finalizado
          </Badge>
        ) : (
          <Badge variant="secondary">{match.competitionNote ?? "Por jugar"}</Badge>
        )}
        {match.competitionNote && !isFinished && !isLive ? null : (
          <span className="text-xs text-muted-foreground">{match.competitionNote}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate font-medium text-foreground">{match.homeTeam}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {teamCode(match.homeTeam)}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-1.5">
          <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {showScore ? match.homeScore : "-"}
          </span>
          <span className="text-muted-foreground">:</span>
          <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {showScore ? match.awayScore : "-"}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {teamCode(match.awayTeam)}
          </span>
          <span className="truncate font-medium text-foreground">{match.awayTeam}</span>
        </div>
      </div>
    </Card>
  )
}
