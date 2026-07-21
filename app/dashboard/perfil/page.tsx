"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

type ProfileForm = {
  name: string;
  email: string;
  whatsapp: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_REGEX = /^\+?[1-9]\d{7,14}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Esc vuelve al panel: sin esto la pantalla no tenía ninguna salida.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/dashboard");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const [formData, setFormData] = useState<ProfileForm>({
    name: "",
    email: "",
    whatsapp: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUsernameField, setHasUsernameField] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/dashboard/perfil");
      return;
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setApiError("");

      const response = await fetch("/api/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cargar el perfil");
      }

      setFormData((prev) => ({
        ...prev,
        name: data.profile?.name || "",
        email: data.profile?.email || session?.user?.email || "",
        whatsapp: data.profile?.whatsapp || "",
        username: data.profile?.username || "",
      }));
      setHasUsernameField(
        data.profile?.username !== null && data.profile?.username !== undefined
      );
    } catch (error: any) {
      setApiError(error.message || "No se pudo cargar tu información de perfil");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "El email es obligatorio";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Ingresa un email válido";
    }

    if (!formData.whatsapp.trim()) {
      nextErrors.whatsapp = "El número de WhatsApp es obligatorio";
    } else if (!WHATSAPP_REGEX.test(formData.whatsapp.replace(/[\s()-]/g, ""))) {
      nextErrors.whatsapp =
        "Ingresa un WhatsApp válido con código de país (ej: +521234567890)";
    }

    const wantsPasswordChange =
      formData.password.trim().length > 0 || formData.confirmPassword.trim().length > 0;

    if (wantsPasswordChange) {
      if (!PASSWORD_REGEX.test(formData.password)) {
        nextErrors.password =
          "La contraseña debe tener mínimo 8 caracteres e incluir letras y números";
      }

      if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = "La confirmación de contraseña no coincide";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          username: hasUsernameField ? formData.username : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el perfil");
      }

      setSuccessMessage(data.message || "Perfil actualizado correctamente");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setErrors({});
    } catch (error: any) {
      setApiError(error.message || "No se pudo actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p className="text-slate-400 mb-8">
            Actualiza tus datos personales y, si lo deseas, cambia tu contraseña.
          </p>

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={`input-field pl-10 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Tu nombre"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={`input-field pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                  }
                  className={`input-field pl-10 ${errors.whatsapp ? "border-red-500" : ""}`}
                  placeholder="+52 123 456 7890"
                />
              </div>
              {errors.whatsapp && (
                <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>
              )}
            </div>

            {hasUsernameField ? (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Usuario / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, username: e.target.value }))
                    }
                    className="input-field pl-10"
                    placeholder="Tu usuario"
                  />
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-slate-800">
              <h2 className="text-white font-semibold mb-1">Cambiar contraseña</h2>
              <p className="text-xs text-slate-400 mb-4">
                Deja estos campos vacíos si no deseas cambiar la contraseña.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className={`input-field pl-10 ${errors.password ? "border-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`input-field pl-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
