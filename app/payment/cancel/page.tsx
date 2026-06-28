import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="card max-w-md text-center">
        <XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">Pago cancelado</h1>
        <p className="text-slate-300 mb-6">No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.</p>
        <Link href="/checkout" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver al checkout
        </Link>
      </div>
    </div>
  );
}
