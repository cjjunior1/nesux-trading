"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  Shield,
  Gift,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsappNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "El número de WhatsApp es obligatorio";
    } else {
      const cleanNumber = formData.whatsappNumber.replace(/[\s-]/g, "");
      if (!/^\+?[1-9]\d{7,14}$/.test(cleanNumber)) {
        newErrors.whatsappNumber = "Ingresa un número válido con código de país (ej: +521234567890)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar");
      }

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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card text-center"
        >
          <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">¡Registro Exitoso!</h1>
          <p className="text-slate-300 mb-6">
            Hemos enviado un email de verificación a <strong className="text-emerald-400">{formData.email}</strong>
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-300">
              <strong>📱 Tu contraseña será enviada por WhatsApp</strong> al número {formData.whatsappNumber} una vez que verifiques tu email.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Pasos a seguir:</p>
            <ol className="text-left text-sm text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                Revisa tu bandeja de entrada (y spam)
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                Haz clic en el enlace de verificación
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                Recibe tu contraseña por WhatsApp
              </li>
            </ol>
          </div>
          <Link href="/login" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
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
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <h1 className="text-4xl font-bold text-white mb-6">
              Comienza tu camino hacia la{" "}
              <span className="gradient-text">libertad financiera</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Regístrate gratis y obtén acceso a contenido exclusivo, comunidad de traders y más.
            </p>

            <div className="space-y-4">
              {[
                "Acceso gratuito a webinars semanales",
                "Comunidad exclusiva de traders",
                "Guía de inicio rápido en trading",
                "Descuentos especiales en cursos",
                "Soporte prioritario por WhatsApp",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span>Datos protegidos</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Gift className="h-5 w-5 text-emerald-500" />
                <span>Sin spam</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h2>
            <p className="text-slate-400 mb-6">Completa todos los campos para registrarte</p>

            {apiError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`input-field pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`input-field pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                      placeholder="Tu apellido"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Número de WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className={`input-field pl-10 ${errors.whatsappNumber ? "border-red-500" : ""}`}
                    placeholder="+52 123 456 7890"
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.whatsappNumber}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Incluye el código de país. Aquí recibirás tu contraseña.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    Crear Mi Cuenta
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-emerald-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
