import { describe, it, expect } from "vitest";
import {
  classifySubscription,
  revenueChangePct,
  proratePlanChange,
  bucketByDay,
} from "./metrics-pure";

const NOW = new Date("2026-06-23T12:00:00Z");
const future = new Date("2026-07-23T12:00:00Z");
const past = new Date("2026-06-01T12:00:00Z");

describe("classifySubscription", () => {
  it("vigente y activa => al_dia", () => {
    expect(classifySubscription(future, "active", NOW)).toBe("al_dia");
  });
  it("vencida y activa => moroso", () => {
    expect(classifySubscription(past, "active", NOW)).toBe("moroso");
  });
  it("estado past_due => moroso aunque la fecha sea futura", () => {
    expect(classifySubscription(future, "past_due", NOW)).toBe("moroso");
  });
  it("cancelada => cancelado", () => {
    expect(classifySubscription(future, "canceled", NOW)).toBe("cancelado");
  });
  it("sin datos => sin_suscripcion", () => {
    expect(classifySubscription(null, null, NOW)).toBe("sin_suscripcion");
  });
});

describe("revenueChangePct", () => {
  it("aumento del 50%", () => expect(revenueChangePct(150, 100)).toBe(50));
  it("sin cambio", () => expect(revenueChangePct(100, 100)).toBe(0));
  it("ambos cero => 0", () => expect(revenueChangePct(0, 0)).toBe(0));
  it("desde cero con ingresos => 100", () => expect(revenueChangePct(50, 0)).toBe(100));
  it("disminución", () => expect(revenueChangePct(80, 100)).toBe(-20));
});

describe("proratePlanChange", () => {
  it("upgrade a mitad de periodo cobra la diferencia prorrateada", () => {
    // de 100 a 200, quedan 15 de 30 días => (200-100)*0.5 = 50
    expect(proratePlanChange(100, 200, 15, 30)).toBe(50);
  });
  it("downgrade no cobra (>= 0)", () => {
    expect(proratePlanChange(200, 100, 15, 30)).toBe(0);
  });
  it("periodo completo cobra la diferencia total", () => {
    expect(proratePlanChange(100, 200, 30, 30)).toBe(100);
  });
  it("sin días restantes => 0", () => {
    expect(proratePlanChange(100, 200, 0, 30)).toBe(0);
  });
});

describe("bucketByDay", () => {
  it("agrupa por día y rellena días vacíos con 0", () => {
    const rows = [
      { date: new Date("2026-06-23T01:00:00Z"), value: 2 },
      { date: new Date("2026-06-23T05:00:00Z"), value: 3 },
      { date: new Date("2026-06-22T05:00:00Z"), value: 1 },
    ];
    const out = bucketByDay(rows, 3, NOW);
    expect(out).toHaveLength(3);
    expect(out[out.length - 1]).toEqual({ date: "2026-06-23", value: 5 });
    expect(out[out.length - 2]).toEqual({ date: "2026-06-22", value: 1 });
    expect(out[0].value).toBe(0);
  });
});
