"use server"

import { db } from "@/lib/db"
import { players, matches, predictions } from "@/lib/db/schema"
import { computePoints } from "@/lib/scoring"
import { and, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- Players ---

export async function joinGame(rawName: string) {
  const name = rawName.trim().slice(0, 40)
  if (!name) throw new Error("El nombre no puede estar vacío")

  const existing = await db.select().from(players).where(eq(players.name, name)).limit(1)
  if (existing.length > 0) {
    return existing[0]
  }
  const inserted = await db.insert(players).values({ name }).returning()
  revalidatePath("/")
  return inserted[0]
}

export async function getPlayerByName(rawName: string) {
  const name = rawName.trim()
  if (!name) return null
  const rows = await db.select().from(players).where(eq(players.name, name)).limit(1)
  return rows[0] ?? null
}

// --- Matches ---

export async function getMatches() {
  return db.select().from(matches).orderBy(matches.sortOrder)
}

// --- Predictions ---

export async function getPredictionsForPlayer(playerId: number) {
  return db.select().from(predictions).where(eq(predictions.playerId, playerId))
}

export async function savePrediction(
  playerId: number,
  matchId: number,
  homePred: number,
  awayPred: number,
) {
  const h = clampScore(homePred)
  const a = clampScore(awayPred)

  // Compute points immediately if the match is already published.
  const match = (await db.select().from(matches).where(eq(matches.id, matchId)).limit(1))[0]
  let points = 0
  if (match?.published && match.homeScore !== null && match.awayScore !== null) {
    points = computePoints(h, a, match.homeScore, match.awayScore)
  }

  await db
    .insert(predictions)
    .values({ playerId, matchId, homePred: h, awayPred: a, points, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [predictions.playerId, predictions.matchId],
      set: { homePred: h, awayPred: a, points, updatedAt: new Date() },
    })

  revalidatePath("/")
  return { ok: true }
}

function clampScore(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0
  if (n > 99) return 99
  return Math.floor(n)
}

// --- Leaderboard ---

export type LeaderboardRow = {
  playerId: number
  name: string
  points: number
  exact: number
  predictionsMade: number
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const rows = await db
    .select({
      playerId: players.id,
      name: players.name,
      points: sql<number>`coalesce(sum(${predictions.points}), 0)`.mapWith(Number),
      exact: sql<number>`coalesce(sum(case when ${predictions.points} = 3 then 1 else 0 end), 0)`.mapWith(
        Number,
      ),
      predictionsMade: sql<number>`count(${predictions.id})`.mapWith(Number),
    })
    .from(players)
    .leftJoin(predictions, eq(predictions.playerId, players.id))
    .groupBy(players.id, players.name)

  return rows.sort((a, b) => b.points - a.points || b.exact - a.exact || a.name.localeCompare(b.name))
}

// --- Results (organizer) ---

export type ResultInput = { matchId: number; homeScore: number | null; awayScore: number | null }

export async function publishResults(results: ResultInput[]) {
  // Update each match result + published flag
  for (const r of results) {
    if (r.homeScore === null || r.awayScore === null) {
      // Unpublish / clear
      await db
        .update(matches)
        .set({ homeScore: null, awayScore: null, published: false })
        .where(eq(matches.id, r.matchId))
    } else {
      await db
        .update(matches)
        .set({ homeScore: clampScore(r.homeScore), awayScore: clampScore(r.awayScore), published: true })
        .where(eq(matches.id, r.matchId))
    }
  }

  // Recompute all prediction points for affected matches.
  const affectedIds = results.map((r) => r.matchId)
  if (affectedIds.length > 0) {
    const affectedMatches = await db.select().from(matches).where(inArray(matches.id, affectedIds))
    const matchMap = new Map(affectedMatches.map((m) => [m.id, m]))

    const affectedPreds = await db
      .select()
      .from(predictions)
      .where(inArray(predictions.matchId, affectedIds))

    for (const p of affectedPreds) {
      const m = matchMap.get(p.matchId)
      let points = 0
      if (m?.published && m.homeScore !== null && m.awayScore !== null) {
        points = computePoints(p.homePred, p.awayPred, m.homeScore, m.awayScore)
      }
      await db
        .update(predictions)
        .set({ points })
        .where(and(eq(predictions.matchId, p.matchId), eq(predictions.playerId, p.playerId)))
    }
  }

  revalidatePath("/")
  return { ok: true }
}
