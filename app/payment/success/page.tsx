import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="card max-w-md text-center">
        <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">¡Pago recibido!</h1>
        <p className="text-slate-300 mb-6">
          Estamos confirmando tu pago. En cuanto se acredite, tu acceso se activa y te avisamos por correo.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
          Ir a mi panel <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
