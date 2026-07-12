'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const checkIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIos(checkIos);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  if (!showBanner && !isIos) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 shadow-2xl z-50 md:hidden">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-sm md:text-base">📱 Instala Trading a Otro Nivel</p>
          <p className="text-xs md:text-sm opacity-90">Acceso rápido desde tu pantalla de inicio</p>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100"
            >
              Instalar
            </button>
          )}
          {isIos && (
            <p className="text-xs opacity-90">Toca Compartir → Agregar a pantalla de inicio</p>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="p-2 hover:bg-emerald-500 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
