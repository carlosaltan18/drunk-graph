"use client";
import { Home, RotateCcw, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";

interface Props {
  variant?: "admin" | "client";
  reset?: () => void;
}

export const ServerError500Screen: React.FC<Props> = ({
  variant = "client",
  reset,
}) => {
  const router = useRouter();
  const isAdmin = variant === "admin";
  const accentColor = isAdmin ? "#f59e0b" : "#f97316";
  const homeHref = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <div
      className="flex flex-col min-h-screen text-[#fafafa]"
      style={{
        backgroundColor: "#09090b",
        fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1.5px 1.5px, #27272a 1px, transparent 0)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div
        className="fixed pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          height: "480px",
          background:
            "radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <header
        className="sticky top-0 z-50 flex items-center px-6 h-14 border-b"
        style={{
          backgroundColor: "#09090b",
          borderColor: "#27272a",
        }}
      >
        <span className="font-black italic text-xl tracking-tighter text-[#ef4444]">
          DRUNKGRAPH
          {isAdmin && <span style={{ color: accentColor }}>.SYS</span>}
        </span>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 text-center z-10">
        <div className="mb-6">
          <Zap
            className="w-10 h-10"
            style={{
              color: "#ef4444",
              filter: "drop-shadow(0 0 12px rgba(239,68,68,0.7))",
            }}
            strokeWidth={2.5}
          />
        </div>

        <div
          className="select-none leading-none mb-8 font-black"
          style={{
            fontSize: "clamp(120px, 38vw, 180px)",
            color: "#ef4444",
            letterSpacing: "-0.06em",
            fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
            fontWeight: 900,
            textShadow:
              "0 0 40px rgba(239,68,68,0.45), 0 0 80px rgba(239,68,68,0.2)",
            lineHeight: 0.88,
          }}
          aria-hidden="true"
        >
          500
        </div>

        <h1
          className="font-black uppercase tracking-tighter mb-4"
          style={{
            fontSize: "clamp(22px, 6vw, 28px)",
            color: "#fafafa",
            letterSpacing: "-0.04em",
            fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif',
          }}
        >
          Something Went Wrong
        </h1>

        <div
          className="w-10 h-px mb-5"
          style={{
            backgroundColor: "#27272a",
          }}
        />

        <p
          className="mb-10 leading-relaxed max-w-xs"
          style={{
            color: "#a1a1aa",
            fontSize: "14px",
            fontWeight: 400,
          }}
        >
          Our servers are having a bit of a moment. Please try again in a few
          minutes.
        </p>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            type="button"
            onClick={reset ?? (() => window.location.reload())}
            className="flex items-center justify-center gap-2 w-full py-4 font-black uppercase tracking-tighter transition-all active:scale-[0.97] hover:brightness-110"
            style={{
              backgroundColor: "#ef4444",
              color: "#fafafa",
              fontSize: "13px",
              letterSpacing: "-0.02em",
              borderRadius: "10px",
            }}
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(homeHref)}
            className="flex items-center justify-center gap-2 w-full py-4 font-black uppercase tracking-tighter transition-all active:scale-[0.97] hover:bg-white/5"
            style={{
              backgroundColor: "transparent",
              color: "#a1a1aa",
              border: "1px solid #27272a",
              fontSize: "13px",
              letterSpacing: "-0.02em",
              borderRadius: "10px",
            }}
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            <span>Go Home</span>
          </button>
        </div>
      </main>

      <footer
        className="relative z-10 py-6 flex justify-center border-t"
        style={{
          borderColor: "#18181b",
        }}
      >
        <p
          className="font-black uppercase tracking-widest"
          style={{
            color: "#3f3f46",
            fontSize: "10px",
          }}
        >
          DRUNKGRAPH{isAdmin ? ".SYS" : ""} · ERROR 500
        </p>
      </footer>
    </div>
  );
};
