"use client"

import { useMemo, useState } from "react"
import type { Match, Player, Prediction } from "@/lib/db/schema"
import { savePrediction } from "@/app/actions/quiniela"
import { groupMatches, computePoints } from "@/lib/scoring"
import { teamCode } from "@/lib/teams"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Props = {
  player: Player
  matches: Match[]
  predictions: Prediction[]
  onSaved: (p: Prediction) => void
}

export function PredictionsTab({ player, matches, predictions, onSaved }: Props) {
  const grouped = useMemo(() => groupMatches(matches), [matches])
  const predMap = useMemo(() => {
    const m = new Map<number, Prediction>()
    for (const p of predictions) m.set(p.matchId, p)
    return m
  }, [predictions])

  const totalMatches = matches.length
  const madeCount = predictions.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Tu progreso</p>
          <p className="text-sm text-muted-foreground">
            {madeCount} de {totalMatches} partidos predichos
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {Math.round((madeCount / totalMatches) * 100)}%
        </Badge>
      </div>

      {grouped.map(([letter, groupGames]) => (
        <Card key={letter} className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/10 px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {letter}
            </span>
            <h2 className="font-semibold text-foreground">Grupo {letter}</h2>
          </div>
          <div className="divide-y divide-border">
            {groupGames.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                playerId={player.id}
                prediction={predMap.get(match.id)}
                onSaved={onSaved}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function MatchRow({
  match,
  playerId,
  prediction,
  onSaved,
}: {
  match: Match
  playerId: number
  prediction?: Prediction
  onSaved: (p: Prediction) => void
}) {
  const locked = match.published
  const [home, setHome] = useState<number>(prediction?.homePred ?? 0)
  const [away, setAway] = useState<number>(prediction?.awayPred ?? 0)
  const [saving, setSaving] = useState(false)

  const hasPrediction = prediction !== undefined
  const dirty = !hasPrediction || prediction.homePred !== home || prediction.awayPred !== away

  // Points preview when match is published.
  const earnedPoints =
    locked && match.homeScore !== null && match.awayScore !== null
      ? computePoints(
          prediction?.homePred ?? home,
          prediction?.awayPred ?? away,
          match.homeScore,
          match.awayScore,
        )
      : null

  async function handleSave() {
    if (locked) return
    setSaving(true)
    try {
      await savePrediction(playerId, match.id, home, away)
      onSaved({
        id: prediction?.id ?? -match.id,
        playerId,
        matchId: match.id,
        homePred: home,
        awayPred: away,
        points: 0,
        updatedAt: new Date(),
      })
      toast.success("Predicción guardada")
    } catch (err) {
      toast.error((err as Error).message ?? "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium text-foreground">
            {match.homeTeam}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{teamCode(match.homeTeam)}</span>
        </div>

        {/* Steppers */}
        <div className="flex items-center gap-1.5">
          <Stepper value={home} onChange={setHome} disabled={locked} />
          <span className="text-muted-foreground">-</span>
          <Stepper value={away} onChange={setAway} disabled={locked} />
        </div>

        {/* Away */}
        <div className="flex flex-1 items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{teamCode(match.awayTeam)}</span>
          <span className="truncate text-sm font-medium text-foreground">{match.awayTeam}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {locked ? (
            <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Final {match.homeScore}-{match.awayScore}
            </Badge>
          ) : hasPrediction ? (
            <span className="flex items-center gap-1 text-secondary">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Guardada
            </span>
          ) : (
            <span className="text-muted-foreground">Sin predecir</span>
          )}
          {earnedPoints !== null && (
            <Badge
              className={cn(
                "border-transparent",
                earnedPoints === 3
                  ? "bg-accent text-accent-foreground"
                  : earnedPoints === 1
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              +{earnedPoints} pts
            </Badge>
          )}
        </div>

        {!locked && (
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
              dirty && !saving
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {saving ? "Guardando..." : dirty ? "Guardar" : "Guardada"}
          </button>
        )}
      </div>
    </div>
  )
}

function Stepper({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        aria-label="Aumentar"
        disabled={disabled}
        onClick={() => onChange(Math.min(99, value + 1))}
        className="flex h-6 w-8 items-center justify-center rounded-md bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="w-8 text-center font-mono text-lg font-bold tabular-nums text-foreground">
        {value}
      </span>
      <button
        type="button"
        aria-label="Disminuir"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-6 w-8 items-center justify-center rounded-md bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-foreground"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
