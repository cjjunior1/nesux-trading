"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";

const TOOL_ROUTES = new Set(["/crossover"]);

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isToolRoute = pathname ? TOOL_ROUTES.has(pathname) : false;

  if (isToolRoute) {
    return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
