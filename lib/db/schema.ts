import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  groupLetter: text("group_letter").notNull(),
  matchday: integer("matchday").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  published: boolean("published").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  matchDate: timestamp("match_date", { withTimezone: true }),
})

export const predictions = pgTable(
  "predictions",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull(),
    matchId: integer("match_id").notNull(),
    homePred: integer("home_pred").notNull(),
    awayPred: integer("away_pred").notNull(),
    points: integer("points").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    playerMatch: unique().on(t.playerId, t.matchId),
  }),
)

export type Player = typeof players.$inferSelect
export type Match = typeof matches.$inferSelect
export type Prediction = typeof predictions.$inferSelect
