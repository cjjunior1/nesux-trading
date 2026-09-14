"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Download, Share, MoreVertical, PlusSquare } from "lucide-react";

/**
 * Descarga/instalación de la app (PWA) para MÓVIL Y PC.
 *
 * Cómo se dispara desde CUALQUIER parte de la web (sin importar este componente):
 *   - Cualquier elemento con el atributo  data-instalar-app
 *   - o lanzando el evento:  window.dispatchEvent(new Event('nx-instalar-app'))
 *
 * Si el navegador permite instalar (Chrome/Edge en PC y Android) sale el diálogo nativo.
 * Si no (iPhone/Safari, Firefox…) se abren las instrucciones exactas de ese navegador.
 */

type Prompt = { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null;

export default function InstallApp() {
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [instalada, setInstalada] = useState(false);
  const [ayuda, setAyuda] = useState(false);   // modal de instrucciones
  const [aviso, setAviso] = useState(false);   // barra flotante de invitación

  useEffect(() => {
    const enModoApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (enModoApp) setInstalada(true);

    const onPrompt = (e: any) => { e.preventDefault(); setPrompt(e); };
    const onInstalada = () => { setInstalada(true); setPrompt(null); setAyuda(false); setAviso(false); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalada);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalada);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") { setPrompt(null); setInstalada(true); }
      return;
    }
    setAyuda(true); // el navegador no ofrece diálogo: explicamos cómo hacerlo
  }, [prompt]);

  // Engancha CUALQUIER botón de la web: [data-instalar-app] o el evento global.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest?.("[data-instalar-app]");
      if (t) { e.preventDefault(); instalar(); }
    };
    const onEvento = () => instalar();
    document.addEventListener("click", onClick);
    window.addEventListener("nx-instalar-app", onEvento);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("nx-instalar-app", onEvento);
    };
  }, [instalar]);

  // Invitación discreta a los 8 s, una vez por día, si aún no la tiene instalada.
  useEffect(() => {
    if (instalada) return;
    let visto = "";
    try { visto = localStorage.getItem("nx_app_aviso") || ""; } catch {}
    if (visto === new Date().toDateString()) return;
    const t = setTimeout(() => setAviso(true), 8000);
    return () => clearTimeout(t);
  }, [instalada]);

  const cerrarAviso = () => {
    setAviso(false);
    try { localStorage.setItem("nx_app_aviso", new Date().toDateString()); } catch {}
  };

  if (instalada) return null;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const esIos = /iPad|iPhone|iPod/.test(ua);
  const esAndroid = /Android/.test(ua);
  const esFirefox = /Firefox/.test(ua);

  return (
    <>
      {/* Invitación flotante (móvil y PC) */}
      {aviso && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[60]
                        rounded-2xl border border-emerald-500/40 bg-slate-900/95 backdrop-blur
                        shadow-2xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-bold text-white text-sm">📲 Descarga la app</p>
            <p className="text-slate-300 text-xs mt-0.5">
              Trading Academy en tu pantalla de inicio o escritorio. Abre más rápido y sin buscador.
            </p>
          </div>
          <button onClick={instalar}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-full px-4 py-2">
            Instalar
          </button>
          <button onClick={cerrarAviso} aria-label="Cerrar" className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Instrucciones cuando el navegador no ofrece el diálogo nativo */}
      {ayuda && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
             onClick={() => setAyuda(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 text-white p-6 relative"
               onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAyuda(false)} aria-label="Cerrar"
                    className="absolute top-3 right-3 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Download className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Instalar Trading Academy</h2>
            </div>

            {esIos ? (
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3"><Share className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Toca <b className="text-white">Compartir</b> en la barra de Safari.</span></li>
                <li className="flex gap-3"><PlusSquare className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Elige <b className="text-white">Añadir a pantalla de inicio</b>.</span></li>
                <li className="flex gap-3"><span className="w-5 text-center text-emerald-500 font-bold">✓</span>
                  <span>Confirma con <b className="text-white">Añadir</b>. Listo.</span></li>
              </ol>
            ) : esAndroid ? (
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3"><MoreVertical className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Abre el menú <b className="text-white">⋮</b> del navegador (arriba a la derecha).</span></li>
                <li className="flex gap-3"><span className="w-5 text-center text-emerald-500 font-bold">2</span>
                  <span>Toca <b className="text-white">Instalar aplicación</b> o <b className="text-white">Añadir a pantalla de inicio</b>.</span></li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3"><span className="w-5 text-center text-emerald-500 font-bold">1</span>
                  <span>En <b className="text-white">Chrome o Edge</b>, mira el icono <b className="text-white">⊕ / pantalla con flecha</b> al final de la barra de direcciones.</span></li>
                <li className="flex gap-3"><span className="w-5 text-center text-emerald-500 font-bold">2</span>
                  <span>O abre el menú <b className="text-white">⋮</b> → <b className="text-white">Instalar Trading Academy</b> (en Edge: Aplicaciones → Instalar este sitio).</span></li>
                {esFirefox && (
                  <li className="flex gap-3"><span className="w-5 text-center text-amber-500 font-bold">!</span>
                    <span>Firefox de escritorio no instala apps web: usa Chrome o Edge.</span></li>
                )}
              </ol>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Se instala como app: icono propio, abre a pantalla completa y sin barra del navegador.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
