"use client";
import Link from "next/link";

export function LoginSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-center px-4">
      <h2 className="section-title">¿Ya tienes una cuenta?</h2>
      <p className="section-subtitle">Ingresa para acceder a tus cursos, avanzar en tu aprendizaje y aprovechar todas las funcionalidades exclusivas.</p>
      <Link
        href="/login"
        className="inline-block text-white font-bold py-3 px-8 rounded-full mt-6 shadow-lg transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: '#2563EB' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
      >
        Iniciar Sesión
      </Link>
    </section>
  );
}
