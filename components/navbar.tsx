
	"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  TrendingUp,
  BookOpen,
  Bot,
  Users,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Inicio", icon: TrendingUp },
  { href: "/metodo", label: "El Método", icon: BookOpen },
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/bots", label: "Bots", icon: Bot },
  { href: "/testimonios", label: "Testimonios", icon: Users },
];

function sendNavAnalytics(eventName: string, itemId?: string) {
  if (typeof window !== 'undefined' && window?.gtag) {
    window.gtag('event', 'nav_click', { item_id: itemId });
  }
  // Disponible para otros tools de analytics aquí
}

function DropdownLanding() {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors rounded-md">
        Landing <span className="ml-1 text-xs"></span>
      </button>
      
      {/* Puente invisible: evita que el hover se pierda al bajar el mouse */}
      <div className="absolute -top-2 left-0 w-full h-4"></div>
      
      <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <Link href="/landing/cj-bot" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors" prefetch={false}>
            <Bot className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold">CJ Bot</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileDropdownLanding({closeMenu}: {closeMenu?: () => void}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <button
        className="flex items-center gap-1 w-full py-2 text-slate-300 hover:text-emerald-400 text-left"
        onClick={e => {e.preventDefault(); setOpen(!open); if (!open) sendNavAnalytics('nav_landing_open');}}
        aria-expanded={open}
        aria-controls="mobile-landing-menu"
      >
        <Bot className="h-5 w-5" />
        Landing <span className="ml-1">▾</span>
      </button>
      {open && (
        <div id="mobile-landing-menu" className="ml-6 border-l-2 border-emerald-500/30 pl-2 mt-1 space-y-1">
          <Link
            href="/landing/cj-bot"
            className="flex items-center p-2 bg-emerald-900/20 rounded gap-2 border-l-4 border-emerald-500 text-emerald-300 mt-1"
            prefetch={false}
            onClick={e => {
              sendNavAnalytics('nav_landing_click', 'cj_bot');
              if (typeof closeMenu === 'function') closeMenu();
              setOpen(false);
            }}
          >
            <Bot className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col ml-1">
              <span className="font-bold leading-tight">CJ Bot</span>
              <span className="text-xs text-emerald-300">Automatiza tu trading, resultado real 24/7</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status ?? "loading";
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">
              Trading Academy <span className="text-emerald-500">A Otro Nivel</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <DropdownLanding />
            {mounted && status === "authenticated" ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  <User className="h-4 w-4 inline mr-1" />
                  {session?.user?.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/registro" className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 py-2"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <MobileDropdownLanding closeMenu={() => setIsOpen(false)} />
              <div className="pt-4 border-t border-slate-700">
                {mounted && status === "authenticated" ? (
                  <button
                    onClick={() => signOut()}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                ) : mounted ? (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-2 text-slate-300"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      onClick={() => setIsOpen(false)}
                      className="block w-full btn-primary text-center"
                    >
                      Registrarse Gratis
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
