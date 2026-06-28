// Funciones PURAS de métricas (sin acceso a BD) — testeables unitariamente.

export type PaymentStanding = "al_dia" | "moroso" | "cancelado" | "sin_suscripcion";

/**
 * Clasifica el estado de pago de un usuario según su suscripción.
 * - "al_dia": vencimiento en el futuro y no cancelada.
 * - "moroso": vencimiento pasado o estado past_due (no cancelada).
 * - "cancelado": suscripción cancelada/expirada.
 * - "sin_suscripcion": no tiene ninguna.
 */
export function classifySubscription(
  currentPeriodEnd: Date | null | undefined,
  status: string | null | undefined,
  now: Date = new Date()
): PaymentStanding {
  if (!currentPeriodEnd && !status) return "sin_suscripcion";
  if (status === "canceled" || status === "expired") return "cancelado";
  if (!currentPeriodEnd) return "sin_suscripcion";
  if (status === "past_due") return "moroso";
  return currentPeriodEnd.getTime() >= now.getTime() ? "al_dia" : "moroso";
}

/** Variación porcentual entre dos periodos (1 decimal). */
export function revenueChangePct(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Prorrateo al cambiar de plan: cobra la diferencia de los días restantes.
 * Devuelve el monto a cobrar (>= 0).
 */
export function proratePlanChange(
  oldAmount: number,
  newAmount: number,
  daysRemaining: number,
  periodDays: number = 30
): number {
  if (periodDays <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, daysRemaining / periodDays));
  const credit = oldAmount * ratio;
  const newCost = newAmount * ratio;
  return Math.round(Math.max(0, newCost - credit) * 100) / 100;
}

/** Agrupa filas {date, value} en cubos por día (YYYY-MM-DD) para los últimos N días. */
export function bucketByDay(
  rows: { date: Date; value: number }[],
  days: number,
  now: Date = new Date()
): { date: string; value: number }[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + r.value);
  }
  return Array.from(buckets, ([date, value]) => ({ date, value }));
}
