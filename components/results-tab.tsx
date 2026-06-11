"use client"

import { useMemo, useState } from "react"
import type { Match } from "@/lib/db/schema"
import { publishResults, type ResultInput } from "@/app/actions/quiniela"
import { fetchFinalResults } from "@/app/actions/scores"
import { groupMatches } from "@/lib/scoring"
import { teamCode, normalizeTeam } from "@/lib/teams"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Send, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Draft = Record<number, { home: string; away: string }>

export function ResultsTab({ matches }: { matches: Match[] }) {
  const router = useRouter()
  const grouped = useMemo(() => groupMatches(matches), [matches])

  const [draft, setDraft] = useState<Draft>(() => {
    const d: Draft = {}
    for (const m of matches) {
      d[m.id] = {
        home: m.homeScore !== null ? String(m.homeScore) : "",
        away: m.awayScore !== null ? String(m.awayScore) : "",
      }
    }
    return d
  })
  const [autoLoading, setAutoLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)

  function setScore(id: number, side: "home" | "away", value: string) {
    const clean = value.replace(/[^0-9]/g, "").slice(0, 2)
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [side]: clean } }))
  }

  async function handleAutocomplete() {
    setAutoLoading(true)
    try {
      const fixtures = matches.map((m) => ({ homeTeam: m.homeTeam, awayTeam: m.awayTeam }))
      const results = await fetchFinalResults(fixtures)
      if (results.length === 0) {
        toast.info("No se encontraron resultados finales todavía")
        return
      }
      // Match results back to fixtures by normalized team names.
      const next = { ...draft }
      let filled = 0
      for (const r of results) {
        const match = matches.find(
          (m) =>
            normalizeTeam(m.homeTeam) === normalizeTeam(r.homeTeam) &&
            normalizeTeam(m.awayTeam) === normalizeTeam(r.awayTeam),
        )
        if (match) {
          next[match.id] = { home: String(r.homeScore), away: String(r.awayScore) }
          filled++
        }
      }
      setDraft(next)
      toast.success(`${filled} resultado(s) autocompletado(s). Revisa y publica.`)
    } catch (err) {
      toast.error((err as Error).message ?? "Error al autocompletar")
    } finally {
      setAutoLoading(false)
    }
  }

  async function handlePublish() {
    const payload: ResultInput[] = matches.map((m) => {
      const d = draft[m.id]
      const hasHome = d.home !== ""
      const hasAway = d.away !== ""
      return {
        matchId: m.id,
        homeScore: hasHome && hasAway ? Number(d.home) : null,
        awayScore: hasHome && hasAway ? Number(d.away) : null,
      }
    })

    setPublishing(true)
    try {
      await publishResults(payload)
      toast.success("Resultados publicados. Puntos recalculados para todos.")
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message ?? "Error al publicar")
    } finally {
      setPublishing(false)
    }
  }

  const filledCount = matches.filter((m) => draft[m.id].home !== "" && draft[m.id].away !== "").length
  const publishedCount = matches.filter((m) => m.published).length

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-foreground">Panel del organizador</h2>
            <p className="text-sm text-muted-foreground">
              {publishedCount} publicados · {filledCount} listos para publicar
            </p>
          </div>
          <Badge variant="secondary">{matches.length} partidos</Badge>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-secondary/15 p-3 text-sm text-foreground/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <p className="text-pretty leading-relaxed">
            Carga los marcadores finales y pulsa <strong>Publicar</strong> para recalcular los puntos
            de todos. Puedes autocompletar buscando los resultados reales en internet y solo revisar.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            onClick={handleAutocomplete}
            disabled={autoLoading || publishing}
            className="flex-1"
          >
            <Sparkles className={cn("h-4 w-4", autoLoading && "animate-pulse")} aria-hidden="true" />
            {autoLoading ? "Buscando resultados..." : "Autocompletar con resultados reales"}
          </Button>
          <Button onClick={handlePublish} disabled={publishing || autoLoading} className="flex-1">
            <Send className="h-4 w-4" aria-hidden="true" />
            {publishing ? "Publicando..." : "Publicar y recalcular"}
          </Button>
        </div>
      </Card>

      {grouped.map(([letter, groupGames]) => (
        <Card key={letter} className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/10 px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {letter}
            </span>
            <h3 className="font-semibold text-foreground">Grupo {letter}</h3>
          </div>
          <div className="divide-y divide-border">
            {groupGames.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex flex-1 items-center justify-end gap-2 text-right">
                  <span className="truncate text-sm font-medium text-foreground">{m.homeTeam}</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {teamCode(m.homeTeam)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Input
                    inputMode="numeric"
                    aria-label={`Goles ${m.homeTeam}`}
                    value={draft[m.id].home}
                    onChange={(e) => setScore(m.id, "home", e.target.value)}
                    className="h-10 w-12 bg-background text-center font-mono text-lg font-bold"
                    placeholder="-"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    inputMode="numeric"
                    aria-label={`Goles ${m.awayTeam}`}
                    value={draft[m.id].away}
                    onChange={(e) => setScore(m.id, "away", e.target.value)}
                    className="h-10 w-12 bg-background text-center font-mono text-lg font-bold"
                    placeholder="-"
                  />
                </div>

                <div className="flex flex-1 items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {teamCode(m.awayTeam)}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">{m.awayTeam}</span>
                  {m.published && (
                    <CheckCircle2
                      className="ml-auto h-4 w-4 shrink-0 text-secondary"
                      aria-label="Publicado"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
