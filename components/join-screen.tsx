"use client"

import { useState } from "react"
import { Trophy, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type Props = {
  onJoin: (name: string) => Promise<void>
}

export function JoinScreen({ onJoin }: Props) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Escribe tu nombre para entrar")
      return
    }
    setLoading(true)
    try {
      await onJoin(name)
    } catch (err) {
      toast.error((err as Error).message ?? "No se pudo entrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Quiniela Mundial 2026
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            Predice los marcadores de la fase de grupos y compite con tus amigos por el primer
            lugar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-lg"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-foreground">
              Tu nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos"
              maxLength={40}
              autoComplete="off"
              className="bg-background"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-4 w-full" size="lg">
            {loading ? "Entrando..." : "Entrar a la quiniela"}
          </Button>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-secondary/15 p-3 text-sm text-foreground/80">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
            <p className="text-pretty leading-relaxed">
              Aviso: tus predicciones serán <strong>visibles para los demás jugadores</strong> en la
              tabla de posiciones.
            </p>
          </div>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <Users className="h-4 w-4" aria-hidden="true" />
          Todos los que entren con el mismo nombre comparten la misma cuenta.
        </p>
      </div>
    </div>
  )
}
