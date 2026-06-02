import Link from "next/link";

export function LoginSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-center px-4">
      <h2 className="section-title">¿Ya tienes una cuenta?</h2>
      <p className="section-subtitle">Ingresa para acceder a tus cursos, avanzar en tu aprendizaje y aprovechar todas las funcionalidades exclusivas.</p>
      <Link href="/login" className="btn-primary inline-block mt-6">
        Iniciar Sesión
      </Link>
    </section>
  );
}
