import type { Match } from "./db/schema"

/**
 * Puntaje:
 * - Marcador exacto: 3 puntos
 * - Acertar el resultado (ganador o empate): 1 punto
 * - Lo demas: 0 puntos
 */
export function computePoints(
  homePred: number,
  awayPred: number,
  homeScore: number,
  awayScore: number,
): number {
  if (homePred === homeScore && awayPred === awayScore) return 3
  const predSign = Math.sign(homePred - awayPred)
  const realSign = Math.sign(homeScore - awayScore)
  if (predSign === realSign) return 1
  return 0
}

export function matchOutcome(home: number | null, away: number | null) {
  if (home === null || away === null) return null
  if (home > away) return "home"
  if (home < away) return "away"
  return "draw"
}

export function groupMatches(matches: Match[]) {
  const groups = new Map<string, Match[]>()
  for (const m of matches) {
    const arr = groups.get(m.groupLetter) ?? []
    arr.push(m)
    groups.set(m.groupLetter, arr)
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}
