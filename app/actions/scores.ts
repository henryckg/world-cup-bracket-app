"use server"

import {
  getTodayMatches,
  getFinishedMatches,
  mapStatus,
  liveMinute,
  competitionNote,
} from "@/lib/football-data"
import { normalizeTeam } from "@/lib/teams"

export type LiveMatch = {
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: "scheduled" | "live" | "finished"
  minute: string | null
  competitionNote: string | null
}

export type FinalResult = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
}

/**
 * Marcadores en vivo / del día de los partidos del Mundial 2026, desde
 * football-data.org (fuente en tiempo real).
 */
export async function fetchLiveScores(): Promise<{ matches: LiveMatch[]; checkedAt: string }> {
  const today = await getTodayMatches()
  const matches: LiveMatch[] = today.map((m) => ({
    homeTeam: m.homeTeam.name ?? m.homeTeam.tla ?? "",
    awayTeam: m.awayTeam.name ?? m.awayTeam.tla ?? "",
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    status: mapStatus(m.status),
    minute: liveMinute(m),
    competitionNote: competitionNote(m),
  }))

  return { matches, checkedAt: new Date().toISOString() }
}

/**
 * Resultados FINALES de una lista de partidos para autocompletar la pestaña de
 * Resultados del organizador. Se cruzan por nombre de equipo (normalizado).
 */
export async function fetchFinalResults(
  fixtures: { homeTeam: string; awayTeam: string }[],
): Promise<FinalResult[]> {
  if (fixtures.length === 0) return []

  const finished = await getFinishedMatches()
  const wanted = new Set(
    fixtures.map((f) => `${normalizeTeam(f.homeTeam)}|${normalizeTeam(f.awayTeam)}`),
  )

  const results: FinalResult[] = []
  for (const m of finished) {
    const home = m.homeTeam.name ?? ""
    const away = m.awayTeam.name ?? ""
    const key = `${normalizeTeam(home)}|${normalizeTeam(away)}`
    const h = m.score.fullTime.home
    const a = m.score.fullTime.away
    if (wanted.has(key) && h !== null && a !== null) {
      results.push({ homeTeam: home, awayTeam: away, homeScore: h, awayScore: a })
    }
  }
  return results
}
