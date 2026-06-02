"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no válido");
        return;
      }

      try {
        const response = await fetch(`/api/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verificado exitosamente");
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar el email");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión. Intenta nuevamente.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full card text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-emerald-400 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4">Verificando tu email...</h1>
            <p className="text-slate-400">Por favor espera un momento</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">¡Email Verificado!</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-300">
                <strong>📱 Revisa tu WhatsApp</strong><br />
                Tu contraseña será enviada a tu número registrado.
              </p>
            </div>
            <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
              Iniciar Sesión <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Error de Verificación</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/registro" className="btn-primary w-full flex items-center justify-center gap-2">
                Intentar Registro Nuevo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="block text-slate-400 hover:text-white transition-colors">
                Volver al Inicio
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
