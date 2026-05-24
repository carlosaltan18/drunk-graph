"use client";
import { ArrowLeft, Ghost } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";

export const General404Screen: React.FC = () => {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 font-sans select-none"
      style={{
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 1.5px 1.5px, #27272a 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mb-6 flex items-center justify-center">
        <Ghost
          size={36}
          strokeWidth={2}
          style={{
            color: "#fbbf24",
            filter: "drop-shadow(0 0 10px rgba(251,191,36,0.5))",
          }}
          aria-hidden="true"
        />
      </div>

      <h1
        className="font-extrabold tracking-tighter uppercase leading-none mb-6"
        style={{
          fontSize: "clamp(7rem, 28vw, 14rem)",
          color: "#fbbf24",
          textShadow:
            "0 0 40px rgba(251,191,36,0.35), 0 0 80px rgba(251,191,36,0.15)",
          lineHeight: 0.88,
        }}
      >
        404
      </h1>

      <h2
        className="font-extrabold tracking-tighter uppercase mb-4 text-center"
        style={{
          fontSize: "clamp(1.25rem, 5vw, 2rem)",
          color: "#fafafa",
        }}
      >
        Page Not Found
      </h2>

      <p
        className="text-center font-medium leading-relaxed mb-12 max-w-[280px]"
        style={{
          color: "#a1a1aa",
          fontSize: "0.9rem",
          letterSpacing: "0.01em",
        }}
      >
        This route doesn't exist or was removed from the lineup.
      </p>

      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2.5 font-extrabold uppercase tracking-tighter transition-all duration-150 active:scale-95 hover:brightness-110"
        style={{
          backgroundColor: "#fbbf24",
          color: "#09090b",
          padding: "0.875rem 2rem",
          borderRadius: "10px",
          fontSize: "0.85rem",
          letterSpacing: "0.05em",
          boxShadow: "0 0 24px rgba(251,191,36,0.25)",
        }}
        aria-label="Go back to dashboard"
      >
        <ArrowLeft size={16} strokeWidth={3} />
        <span>Back to Dashboard</span>
      </button>

      <p
        className="mt-16 font-extrabold uppercase"
        style={{
          color: "#3f3f46",
          fontSize: "0.6rem",
          letterSpacing: "0.25em",
        }}
      >
        DrunkGraph / Error 404
      </p>
    </main>
  );
};
