"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bitcoin, CreditCard, Landmark, CheckCircle, Copy, Loader2, ArrowRight, ShieldCheck,
} from "lucide-react";

type Method = "crypto" | "stripe" | "paypal" | "bank_transfer";

const METHODS: { id: Method; label: string; icon: any; note?: string }[] = [
  { id: "bank_transfer", label: "Transferencia bancaria", icon: Landmark, note: "10% de descuento" },
  { id: "stripe", label: "Tarjeta de crédito/débito", icon: CreditCard },
  { id: "crypto", label: "Criptomonedas (USDT, BTC…)", icon: Bitcoin },
  { id: "paypal", label: "PayPal", icon: () => <span className="font-bold text-sky-400">P</span> },
];

function CheckoutInner() {
  const params = useSearchParams();
  const { data: session, status: authStatus } = useSession();
  const productId = params.get("product");
  const baseAmount = Number(params.get("amount") || 0);
  const productName = params.get("name") || "Acceso a Trading a Otro Nivel";

  const [method, setMethod] = useState<Method>("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [payStatus, setPayStatus] = useState<string>("");
  const [copied, setCopied] = useState("");
  const pollRef = useRef<any>(null);

  // Polling del estado del pago (cripto / transferencia)
  useEffect(() => {
    if (!result?.payment_id || payStatus === "paid") return;
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/payments/${result.payment_id}/status`).then((x) => x.json()).catch(() => null);
      if (r?.status) setPayStatus(r.status);
      if (r?.status === "paid") clearInterval(pollRef.current);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [result, payStatus]);

  // Clic en un método -> va directo a su pago (pide login si hace falta).
  const start = (m: Method) => {
    setMethod(m);
    if (authStatus !== "authenticated") { window.location.href = "/login"; return; }
    pay(m);
  };

  const pay = async (m: Method) => {
    setError(""); setLoading(true); setResult(null); setPayStatus("");
    try {
      const r = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: m, product_id: productId, amount: baseAmount, currency: "USD" }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No se pudo iniciar el pago");
      // Stripe / PayPal: redirigir a la pasarela
      if (d.checkout_url) { window.location.href = d.checkout_url; return; }
      setResult(d);
      setPayStatus("pending");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(""), 1500); });
  };

  if (authStatus === "loading") return <div className="pt-24 text-center text-slate-400">Cargando…</div>;

  // Pago confirmado
  if (payStatus === "paid") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">¡Pago confirmado!</h1>
          <p className="text-slate-300 mb-6">Tu acceso fue activado. Revisa tu correo y entra a tu panel.</p>
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">Ir a mi panel <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Finalizar compra</h1>
        <p className="text-slate-400 mb-6">{productName}{baseAmount > 0 && <> — <span className="text-emerald-400 font-semibold">${baseAmount.toFixed(2)} USD</span></>}</p>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        {!result && (
          <>
            <p className="text-sm text-slate-400 mb-3">Elige cómo quieres pagar:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => start(m.id)} disabled={loading}
                    className="flex items-center gap-3 p-4 rounded-xl border text-left transition-colors border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-emerald-500 disabled:opacity-50">
                    <Icon className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-white text-sm font-medium">{m.label}</div>
                      {m.note && <div className="text-xs text-amber-300">{m.note}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
            {loading && <p className="text-sm text-slate-400 mt-4 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</p>}
            {authStatus !== "authenticated" && <p className="text-xs text-slate-500 mt-3">Deberás iniciar sesión para completar el pago.</p>}
          </>
        )}

        {/* Resultado: TRANSFERENCIA (varios bancos) */}
        {result?.bank_accounts && (
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-1">Datos para tu transferencia</h2>
            <p className="text-sm text-slate-400 mb-4">
              Transfiere <b className="text-emerald-400">${result.amount.toFixed(2)} USD</b> (ahorraste ${result.discount_applied.toFixed(2)}) a <b>cualquiera</b> de estas cuentas y coloca la referencia en el concepto.
            </p>

            {/* Referencia destacada (igual para todas las cuentas) */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-emerald-200">Referencia (concepto)</span>
              <span className="flex items-center gap-2 font-mono font-bold text-emerald-300">{result.reference}
                <button onClick={() => copy(result.reference, "ref")} className="text-slate-400 hover:text-emerald-400"><Copy size={14} /></button>
                {copied === "ref" && <span className="text-xs">✓</span>}
              </span>
            </div>

            {/* Lista de bancos */}
            <div className="space-y-3">
              {result.bank_accounts.map((b: any, i: number) => (
                <div key={i} className="border border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between"><span className="text-slate-400 text-sm">Banco</span><span className="text-white text-sm font-medium">{b.bank_name}{b.currency ? ` · ${b.currency}` : ""}</span></div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-400 text-sm">Cuenta</span>
                    <span className="flex items-center gap-2 font-mono text-white text-sm">{b.account_number}
                      <button onClick={() => copy(b.account_number, "acc" + i)} className="text-slate-500 hover:text-emerald-400"><Copy size={14} /></button>
                      {copied === "acc" + i && <span className="text-emerald-400 text-xs">✓</span>}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1"><span className="text-slate-400 text-sm">Titular</span><span className="text-white text-sm">{b.account_holder}</span></div>
                  {b.type && <div className="flex justify-between mt-1"><span className="text-slate-400 text-sm">Tipo</span><span className="text-white text-sm">{b.type}</span></div>}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
              ⚠️ Tu acceso se activa cuando un administrador <b>verifique la transferencia</b>. Te avisaremos por correo.
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Esperando confirmación…</p>
          </div>
        )}

        {/* Resultado: CRIPTO */}
        {result?.pay_address && (
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-1">Paga con cripto</h2>
            <p className="text-sm text-slate-400 mb-4">Envía exactamente esta cantidad a la dirección. El acceso se activa al confirmarse en la red.</p>
            <div className="bg-slate-800 rounded-lg p-3 mb-3">
              <div className="text-xs text-slate-400">Monto</div>
              <div className="text-xl font-bold text-emerald-400">{result.pay_amount} {String(result.pay_currency).toUpperCase()}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 mb-3">
              <div className="text-xs text-slate-400 mb-1">Dirección</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-white break-all">{result.pay_address}</span>
                <button onClick={() => copy(result.pay_address, "addr")} className="text-slate-500 hover:text-emerald-400 flex-shrink-0"><Copy size={16} /></button>
              </div>
              {copied === "addr" && <span className="text-emerald-400 text-xs">✓ Copiada</span>}
            </div>
            {result.pay_url && <a href={result.pay_url} target="_blank" rel="noreferrer" className="btn-secondary w-full inline-flex items-center justify-center gap-2 mb-3">Abrir página de pago <ArrowRight size={16} /></a>}
            <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Esperando confirmación en la red…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-slate-400">Cargando…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
