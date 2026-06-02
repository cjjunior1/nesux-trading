import type React from "react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
