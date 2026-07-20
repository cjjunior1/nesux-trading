import Link from "next/link";
import { TrendingUp, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">
                Trading Academy <span className="text-emerald-500">A Otro Nivel</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-4 max-w-md">
              Transformamos personas comunes en traders exitosos. Nuestro método
              probado te lleva de la mano hacia la libertad financiera.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cursos" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Cursos
                </Link>
              </li>
              <li>
                <Link href="/bots" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Bots de Trading
                </Link>
              </li>
              <li>
                <Link href="/testimonios" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Testimonios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <a href="mailto:trading@nesuxglobalbusinessrd.com" className="hover:text-emerald-400 transition-colors text-sm whitespace-nowrap">
                  trading@nesuxglobalbusinessrd.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-4">
            <strong>AVISO LEGAL:</strong> El trading de divisas, criptomonedas y
            otros instrumentos financieros conlleva un alto nivel de riesgo y puede
            no ser adecuado para todos los inversores. No ofrecemos hacerte un
            trader profesional ni garantizamos que no hay riesgos de pérdida de tu
            capital. Los resultados pasados no garantizan resultados futuros. Este
            material tiene fines educativos. La universidad no hace al profesional,
            solo es una base de introducción al conocimiento.
          </p>
          <p className="text-center text-slate-500 text-sm">
            © 2026 Trading Academy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
