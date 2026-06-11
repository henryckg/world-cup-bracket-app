"use server"

import { generateText } from "ai"

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

const MODEL = "google/gemini-2.5-flash"

function extractJson(text: string): unknown {
  // Strip code fences and find the first JSON array/object.
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
  const start = cleaned.search(/[[{]/)
  if (start === -1) throw new Error("No se encontró JSON en la respuesta")
  const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"))
  const slice = cleaned.slice(start, end + 1)
  return JSON.parse(slice)
}

/**
 * Busca en internet los marcadores en vivo / del día de los partidos
 * del Mundial 2026 usando Gemini con Google Search grounding.
 */
export async function fetchLiveScores(): Promise<{ matches: LiveMatch[]; checkedAt: string }> {
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const { text } = await generateText({
    model: MODEL,
    // @ts-expect-error - google_search grounding tool is provider-specific
    tools: { google_search: {} },
    prompt: `Hoy es ${today}. Busca en internet los partidos de FÚTBOL del Mundial / Copa del Mundo 2026 (FIFA World Cup 2026) que se jueguen HOY, incluyendo los que están EN VIVO en este momento y los que ya terminaron hoy.

Devuelve EXCLUSIVAMENTE un arreglo JSON (sin texto adicional, sin markdown) con este formato exacto:
[
  {
    "homeTeam": "nombre del equipo local en inglés",
    "awayTeam": "nombre del equipo visitante en inglés",
    "homeScore": número o null si aún no empieza,
    "awayScore": número o null si aún no empieza,
    "status": "scheduled" | "live" | "finished",
    "minute": "minuto de juego como '67'' o 'Medio tiempo' si está en vivo, si no null",
    "competitionNote": "breve nota como 'Grupo A' o la hora de inicio, o null"
  }
]

Reglas:
- Usa nombres de equipos en inglés (ej: "Mexico", "South Korea", "Brazil").
- Si no hay ningún partido del Mundial 2026 hoy, devuelve un arreglo vacío [].
- No inventes marcadores: si no estás seguro, usa null en los scores y status "scheduled".`,
  })

  let matches: LiveMatch[] = []
  try {
    const parsed = extractJson(text)
    if (Array.isArray(parsed)) {
      matches = parsed.map((m: Record<string, unknown>) => ({
        homeTeam: String(m.homeTeam ?? ""),
        awayTeam: String(m.awayTeam ?? ""),
        homeScore: typeof m.homeScore === "number" ? m.homeScore : null,
        awayScore: typeof m.awayScore === "number" ? m.awayScore : null,
        status: (["scheduled", "live", "finished"].includes(m.status as string)
          ? m.status
          : "scheduled") as LiveMatch["status"],
        minute: m.minute != null ? String(m.minute) : null,
        competitionNote: m.competitionNote != null ? String(m.competitionNote) : null,
      }))
    }
  } catch (e) {
    console.log("[v0] fetchLiveScores parse error:", (e as Error).message)
    throw new Error("No se pudieron interpretar los marcadores. Intenta de nuevo en unos segundos.")
  }

  return { matches, checkedAt: new Date().toISOString() }
}

/**
 * Busca en internet los resultados FINALES de una lista de partidos para
 * autocompletar la pestaña de Resultados del organizador.
 */
export async function fetchFinalResults(
  fixtures: { homeTeam: string; awayTeam: string }[],
): Promise<FinalResult[]> {
  if (fixtures.length === 0) return []

  const list = fixtures.map((f, i) => `${i + 1}. ${f.homeTeam} vs ${f.awayTeam}`).join("\n")

  const { text } = await generateText({
    model: MODEL,
    // @ts-expect-error - google_search grounding tool is provider-specific
    tools: { google_search: {} },
    prompt: `Busca en internet los resultados FINALES reales de estos partidos del Mundial 2026 (FIFA World Cup 2026). Solo los partidos que ya terminaron:

${list}

Devuelve EXCLUSIVAMENTE un arreglo JSON (sin texto adicional, sin markdown) con este formato:
[
  { "homeTeam": "...", "awayTeam": "...", "homeScore": número, "awayScore": número }
]

Reglas:
- Usa exactamente los mismos nombres de equipos que te di.
- Incluye SOLO los partidos que ya finalizaron y de los que conozcas el marcador real con certeza.
- Si un partido no se ha jugado o no conoces el resultado, NO lo incluyas en el arreglo.
- No inventes marcadores.`,
  })

  try {
    const parsed = extractJson(text)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (m: Record<string, unknown>) =>
          typeof m.homeScore === "number" && typeof m.awayScore === "number",
      )
      .map((m: Record<string, unknown>) => ({
        homeTeam: String(m.homeTeam ?? ""),
        awayTeam: String(m.awayTeam ?? ""),
        homeScore: m.homeScore as number,
        awayScore: m.awayScore as number,
      }))
  } catch (e) {
    console.log("[v0] fetchFinalResults parse error:", (e as Error).message)
    throw new Error("No se pudieron interpretar los resultados. Intenta de nuevo.")
  }
}
