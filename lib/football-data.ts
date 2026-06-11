// Client for football-data.org (https://www.football-data.org/documentation/quickstart)
// Used as the real-time source for World Cup 2026 fixtures and live scores.

const BASE = "https://api.football-data.org/v4"
const COMPETITION = "WC" // FIFA World Cup
const TIMEZONE = "America/Mexico_City"

export type FootballDataStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED"

export type FootballDataMatch = {
  id: number
  utcDate: string
  status: FootballDataStatus
  minute: number | null
  stage: string | null
  group: string | null
  homeTeam: { name: string | null; tla: string | null }
  awayTeam: { name: string | null; tla: string | null }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

function authToken(): string {
  const token = process.env.FOOTBALL_DATA_API_KEY
  if (!token) {
    throw new Error(
      "Falta FOOTBALL_DATA_API_KEY. Agrégala en las variables de entorno (football-data.org).",
    )
  }
  return token
}

async function request(path: string): Promise<{ matches: FootballDataMatch[] }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": authToken() },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    if (res.status === 429) {
      throw new Error("Límite de solicitudes alcanzado. Espera un momento e intenta de nuevo.")
    }
    if (res.status === 403 || res.status === 401) {
      throw new Error("La API key de football-data.org no es válida o no tiene acceso al Mundial.")
    }
    throw new Error(`Error de football-data.org (${res.status}). ${body.slice(0, 120)}`)
  }
  return res.json()
}

// YYYY-MM-DD for a Date in a given IANA timezone.
function ymdInTimeZone(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function ymdUTC(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/**
 * Returns the World Cup matches taking place "today" in Mexico time, including
 * scheduled, live and finished. Queries a UTC window wide enough to cover the
 * local day regardless of timezone offset, then filters by local date.
 */
export async function getTodayMatches(): Promise<FootballDataMatch[]> {
  const now = new Date()
  const todayLocal = ymdInTimeZone(now, TIMEZONE)
  const dateFrom = ymdUTC(addDays(now, -1))
  const dateTo = ymdUTC(addDays(now, 1))

  const data = await request(
    `/competitions/${COMPETITION}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
  )
  return (data.matches ?? [])
    .filter((m) => ymdInTimeZone(new Date(m.utcDate), TIMEZONE) === todayLocal)
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
}

/** Returns all finished World Cup matches of the current season. */
export async function getFinishedMatches(): Promise<FootballDataMatch[]> {
  const data = await request(`/competitions/${COMPETITION}/matches?status=FINISHED`)
  return data.matches ?? []
}

export function mapStatus(status: FootballDataStatus): "scheduled" | "live" | "finished" {
  if (status === "IN_PLAY" || status === "PAUSED") return "live"
  if (status === "FINISHED" || status === "AWARDED") return "finished"
  return "scheduled"
}

/** Human-readable live minute, e.g. "67'", "Medio tiempo" or "En vivo". */
export function liveMinute(match: FootballDataMatch): string | null {
  if (match.status === "PAUSED") return "Medio tiempo"
  if (match.status === "IN_PLAY") return match.minute != null ? `${match.minute}'` : "En vivo"
  return null
}

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_16: "Octavos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINALS: "Cuartos",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
}

/** Short note like "Grupo A" or the stage name. */
export function competitionNote(match: FootballDataMatch): string | null {
  if (match.group) return `Grupo ${match.group.replace(/^GROUP_/, "")}`
  if (match.stage) return STAGE_LABELS[match.stage] ?? match.stage
  return null
}
