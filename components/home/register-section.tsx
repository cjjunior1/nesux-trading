import Link from "next/link";

export function RegisterSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 text-center px-4">
      <h2 className="section-title gradient-text">¿Aún no tienes cuenta?</h2>
      <p className="section-subtitle">Regístrate y comienza a aprender trading de la manera más inteligente: con acceso de por vida, soporte, y herramientas de automatización únicas.</p>
      <Link href="/registro" className="btn-secondary mt-6">
        Registrarme Gratis
      </Link>
    </section>
  );
}
