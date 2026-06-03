"use client";
import { ChevronLeft, GlassWater } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { AppHeader } from "./AppHeader";

export const DrinkNotFoundScreen: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="flex flex-col min-h-screen drunk-grid"
      style={{
        backgroundColor: "#09090b",
        fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
      }}
    >
      <AppHeader onBack={() => router.back()} showLogo={true} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-6 flex items-center justify-center">
          <div
            className="w-20 h-20 flex items-center justify-center rounded-2xl border border-[#27272a]"
            style={{
              backgroundColor: "#18181b",
            }}
          >
            <GlassWater
              className="w-9 h-9"
              style={{
                color: "#f97316",
                filter: "drop-shadow(0 0 8px rgba(249,115,22,0.6))",
              }}
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div
          className="font-black leading-none select-none orange-glow"
          style={{
            fontSize: "clamp(7rem, 30vw, 10rem)",
            color: "#f97316",
            letterSpacing: "-0.05em",
            fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
          }}
          aria-hidden="true"
        >
          404
        </div>

        <div
          className="w-16 h-px my-6"
          style={{
            backgroundColor: "#27272a",
          }}
        />

        <h1
          className="font-black uppercase tracking-tighter text-center leading-none mb-5"
          style={{
            fontSize: "clamp(1.75rem, 8vw, 2.5rem)",
            color: "#fafafa",
            fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
          }}
        >
          Drink Not Found
        </h1>

        <p
          className="text-center text-base font-medium leading-relaxed mb-10 max-w-xs"
          style={{
            color: "#a1a1aa",
          }}
        >
          This beverage is no longer on the menu. Check out our other refreshing
          options.
        </p>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full max-w-xs flex items-center justify-center gap-2 py-4 px-8 font-black uppercase tracking-widest text-sm text-white rounded-xl transition-all active:scale-95 hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            boxShadow: "0 4px 24px rgba(249,115,22,0.25)",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/browse")}
          className="mt-4 text-[11px] font-black uppercase tracking-widest transition-colors text-[#52525b] hover:text-[#a1a1aa]"
        >
          Browse all drinks →
        </button>
      </main>

      <footer
        className="w-full border-t py-4 px-6 flex items-center justify-between"
        style={{
          borderColor: "#27272a",
          backgroundColor: "#09090b",
        }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{
            color: "#3f3f46",
          }}
        >
          DRUNKGRAPH.SYS
        </span>
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{
            color: "#3f3f46",
          }}
        >
          ERROR 404
        </span>
      </footer>
    </div>
  );
};
