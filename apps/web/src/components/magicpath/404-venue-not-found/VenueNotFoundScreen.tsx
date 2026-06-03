"use client";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";

export const VenueNotFoundScreen: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col drunk-grid select-none">
      <header className="w-full h-14 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between px-5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded border border-[#27272a] bg-[#18181b] hover:border-[#fbbf24]/50 hover:bg-[#18181b] transition-all group"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#fbbf24] transition-colors" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black italic text-base tracking-tighter text-[#fbbf24] leading-none">
              DRUNKGRAPH<span className="text-[#fafafa]">.SYS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#18181b] px-2.5 py-1 rounded border border-[#27272a]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
          <span className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-widest">
            System Active
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
          }}
          className="flex flex-col items-center text-center w-full max-w-xs"
        >
          <div className="mb-6">
            <div className="w-16 h-16 rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/5 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#fbbf24]" strokeWidth={1.5} />
            </div>
          </div>

          <h1
            className="text-[108px] font-black tracking-tighter uppercase leading-none text-[#fbbf24] text-shadow-glow mb-0"
            style={{
              fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
            }}
          >
            404
          </h1>

          <h2
            className="text-2xl font-extrabold tracking-tighter uppercase text-[#fafafa] mt-2 mb-4 leading-tight"
            style={{
              fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
            }}
          >
            Venue Not Found
          </h2>

          <p className="text-sm text-[#a1a1aa] font-medium leading-relaxed mb-10 max-w-[260px]">
            We could not find the bar or restaurant you are looking for. It
            might have changed its name or left our platform.
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="w-full py-4 px-6 rounded-xl bg-[#fbbf24] text-[#09090b] font-black text-sm uppercase tracking-widest hover:bg-[#f59e0b] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 mb-4"
          >
            <MapPin className="w-4 h-4" />
            <span>Back to Venues</span>
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-black text-[#a1a1aa] uppercase tracking-widest hover:text-[#fafafa] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Return to previous page</span>
          </button>
        </motion.div>
      </main>

      <footer className="border-t border-[#27272a] py-5 px-6 text-center">
        <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.3em]">
          DrunkGraph • Hospitality Network
        </p>
      </footer>
    </div>
  );
};
