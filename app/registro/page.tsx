"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User, Mail, Phone, ArrowRight, CheckCircle, Shield, Gift, AlertCircle, Loader2,
} from "lucide-react";
import { COUNTRIES, flagOf, buildPhoneE164 } from "@/lib/countries";

export default function RegistroPage() {
  const DEFAULT_COUNTRY = String(COUNTRIES.findIndex((x) => x.c === "DO"));
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", country: DEFAULT_COUNTRY, area: "809", localNumber: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  // Quien ya tenia cuenta Nesux no recibe credenciales nuevas: se le vincula a este
  // negocio y entra con las de siempre. La pantalla final debe decir eso, no "revisa tu correo".
  const [avisoCuentaExistente, setAvisoCuentaExistente] = useState("");
  const [apiError, setApiError] = useState("");

  const countryOf = (idx: string) => COUNTRIES[Number(idx)];
  const areasOf = (idx: string) => countryOf(idx)?.areas;
  /** Prefijo real: el del país, más el código de área si ese país los tiene (RD). */
  const dialOf = (data = formData) => {
    const c = countryOf(data.country);
    if (!c) return "+1";
    return c.areas?.length ? `${c.d}${data.area}` : c.d;
  };
  const fullWhatsapp = (data = formData) => buildPhoneE164(dialOf(data), data.localNumber);

  const validate = (data = formData) => {
    const e: Record<string, string> = {};

    // Hacen falta los dos: el ID se genera con la inicial de cada uno.
    if (!data.firstName.trim()) e.firstName = "Ingresa tu nombre";
    if (!data.lastName.trim()) e.lastName = "Ingresa tu apellido";

    if (!data.email.trim()) e.email = "El correo electrónico es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "El formato del correo no es válido";

    const digits = data.localNumber.replace(/\D/g, "");
    if (!digits) e.localNumber = "Ingresa tu número de WhatsApp";
    else if (digits.length < 7 || digits.length > 14) e.localNumber = "El número no parece válido. Escribe solo tu número, sin el código de país.";

    return e;
  };

  const onChange = (field: string, value: string) => {
    const next = { ...formData, [field]: value };
    // Al cambiar de país, dejar seleccionado su primer código de área.
    if (field === "country") next.area = areasOf(value)?.[0] || "";
    setFormData(next);
    if (touched) setErrors(validate(next));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError("");
    setTouched(true);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          whatsappNumber: fullWhatsapp(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar");
      setRegisteredEmail(data.email || formData.email.trim());
      setAvisoCuentaExistente(data.alreadyRegistered ? data.message || "" : "");
      setSuccess(true);
    } catch (error: any) {
      setApiError(error.message || "Error al procesar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full card text-center">
          <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {avisoCuentaExistente ? "¡Ya estás dentro!" : "¡Registro exitoso!"}
          </h1>
          {avisoCuentaExistente ? (
            <p className="text-slate-300 mb-4">{avisoCuentaExistente}</p>
          ) : (
            <p className="text-slate-300 mb-4">
              Para poder iniciar sesión debes ir a tu <strong className="text-emerald-400">WhatsApp</strong> y a tu <strong className="text-emerald-400">correo</strong>:
              enviamos tu <strong>ID de usuario por WhatsApp</strong> y tu <strong>contraseña al correo {registeredEmail}</strong>.
            </p>
          )}

          {!avisoCuentaExistente && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-300">⚠️ Por seguridad, deberás cambiar tu contraseña la primera vez que inicies sesión.</p>
            </div>
          )}
          <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
            Ir a Iniciar Sesión <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Beneficios */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
            <h1 className="title-anim text-4xl font-bold text-white mb-6">
              Comienza tu camino hacia la <span className="gradient-text">libertad financiera</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Regístrate y recibe al instante tu ID de usuario y tu acceso. Sin complicaciones.
            </p>
            <div className="space-y-4">
              {["Acceso a webinars semanales", "Comunidad exclusiva de traders", "Guía de inicio rápido", "Descuentos especiales en cursos", "Soporte prioritario por WhatsApp"].map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Shield className="h-5 w-5 text-emerald-500" /><span>Datos protegidos</span></div>
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Gift className="h-5 w-5 text-emerald-500" /><span>Sin spam</span></div>
            </div>
          </motion.div>

          {/* Formulario */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
            <p className="text-slate-400 mb-6">Te generaremos un ID de usuario y una contraseña automáticamente.</p>

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Nombre y Apellido (separados: el ID usa la inicial de cada uno) */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => onChange("firstName", e.target.value)}
                      className={`input-field pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                      placeholder="Juan"
                    />
                  </div>
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Apellido *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => onChange("lastName", e.target.value)}
                      className={`input-field pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                      placeholder="Hernández"
                    />
                  </div>
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* WhatsApp: país (con código) + número local */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.country}
                    onChange={(e) => onChange("country", e.target.value)}
                    className="input-field w-auto max-w-[38%]"
                    title="Selecciona tu país"
                  >
                    {COUNTRIES.map((c, i) => (
                      <option key={i} value={i}>{c.n} {flagOf(c.c)} ({c.d})</option>
                    ))}
                  </select>
                  {/* Código de área, solo en los países que tienen varios (RD) */}
                  {areasOf(formData.country)?.length ? (
                    <select
                      value={formData.area}
                      onChange={(e) => onChange("area", e.target.value)}
                      className="input-field w-auto"
                      title="Código de área"
                    >
                      {areasOf(formData.country)!.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  ) : null}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.localNumber}
                      onChange={(e) => onChange("localNumber", e.target.value.replace(/\D/g, ""))}
                      className={`input-field pl-10 ${errors.localNumber ? "border-red-500" : ""}`}
                      placeholder="Ej: 8128214"
                    />
                  </div>
                </div>
                {errors.localNumber && <p className="text-red-400 text-xs mt-1">{errors.localNumber}</p>}
                <p className="text-xs text-slate-500 mt-1">
                  Tu WhatsApp completo: <span className="text-emerald-400 font-mono">{fullWhatsapp() || dialOf()}</span>. Aquí recibirás tu ID.
                </p>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? (<><Loader2 className="h-5 w-5 animate-spin" /> Registrando...</>) : (<>Registrarme y recibir mis accesos <ArrowRight className="h-5 w-5" /></>)}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              ¿Ya tienes cuenta? <Link href="/login" className="text-emerald-400 hover:underline">Inicia sesión</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
