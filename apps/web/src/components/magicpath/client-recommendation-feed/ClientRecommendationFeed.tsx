"use client";
import type { components } from "@generated/api/schema.d.ts";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Beer,
  ChevronRight,
  Flame,
  GlassWater,
  SlidersHorizontal,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { ClientBottomNav } from "@/components/magicpath/shared/ClientBottomNav";
import { DrinkImage } from "@/components/magicpath/shared/DrinkImage";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { useTastes } from "@/lib/hooks/useTastes";

type ApiRecommendation = components["schemas"]["Recommendation"];

// --- Types ---

interface DrinkRecommendation {
  id: string;
  name: string;
  category: "cocktail" | "beer" | "spirit" | "wine";
  scoreFinal: number;
  price: string;
  place: string;
  imageUrl: string | null;
}
const _NAV_LINKS = [
  { label: "Feed", href: "/dashboard" },
  { label: "Browse", href: "/dashboard/browse" },
  { label: "History", href: "/dashboard/history" },
  { label: "Profile", href: "/dashboard/profile" },
];

// --- Helpers ---

function getCategoryGradient(
  category: DrinkRecommendation["category"],
): string {
  switch (category) {
    case "cocktail":
      return "from-orange-600 to-rose-700";
    case "beer":
      return "from-amber-500 to-yellow-600";
    case "spirit":
      return "from-violet-600 to-indigo-700";
    case "wine":
      return "from-rose-600 to-pink-800";
    default:
      return "from-zinc-700 to-zinc-800";
  }
}
function _getCategoryIcon(category: DrinkRecommendation["category"]) {
  switch (category) {
    case "cocktail":
      return <GlassWater className="w-5 h-5 text-white/60" />;
    case "beer":
      return <Beer className="w-5 h-5 text-white/60" />;
    case "spirit":
      return <Flame className="w-5 h-5 text-white/60" />;
    case "wine":
      return <Wine className="w-5 h-5 text-white/60" />;
    default:
      return null;
  }
}
function toPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

// --- Sub-components ---
const DrinkCard = ({ drink }: { drink: DrinkRecommendation }) => (
  <Link href={`/dashboard/drinks/${drink.id}`}>
    <motion.article
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-[12px] overflow-hidden"
    >
      <DrinkImage
        src={drink.imageUrl}
        alt={drink.name}
        className="h-[120px] w-full"
        fallbackGradient={getCategoryGradient(drink.category)}
        sizes="(max-width: 640px) 50vw, 25vw"
      />

      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
          {drink.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
            {drink.category}
          </span>
          <span className="text-zinc-400 text-[11px] font-medium">
            {drink.price}
          </span>
        </div>
        <span className="text-[10px] text-orange-500 font-bold">
          {drink.scoreFinal}% match
        </span>
      </div>
    </motion.article>
  </Link>
);

// --- Main Component ---

interface Props {
  fallbackRecommendations: ApiRecommendation[];
  fallbackTastes: Record<string, number>;
}

export const ClientRecommendationFeed = ({
  fallbackRecommendations,
  fallbackTastes,
}: Props) => {
  const { recommendations } = useRecommendations(fallbackRecommendations);
  const { tastes } = useTastes(fallbackTastes);

  const hasTastes = Object.keys(tastes).length > 0;

  const drinks: DrinkRecommendation[] = (recommendations ?? []).map((r) => ({
    id: r.drinkId ?? "",
    name: r.drink ?? "Unknown",
    category: (r.category ?? "cocktail") as DrinkRecommendation["category"],
    scoreFinal: toPercent(r.scoreFinal ?? 0),
    price: `Q ${r.price?.toFixed(0) ?? "—"}`,
    place: "",
    imageUrl: r.imageUrls?.[0] ?? null,
  }));

  const state: "results" | "no-profile" | "no-results" = !hasTastes
    ? "no-profile"
    : drinks.length === 0
      ? "no-results"
      : "results";
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30 pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-6xl font-black tracking-tighter text-white"
        >
          YOUR PICKS
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mt-1"
        >
          <p className="text-zinc-500 text-sm font-medium">
            Based on your flavor profile.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="flex items-center gap-1 text-orange-500 text-xs font-bold uppercase tracking-widest hover:text-orange-400 transition-colors"
          >
            Edit profile <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </header>

      {/* Content */}
      <main className="px-6">
        <AnimatePresence mode="wait">
          {state === "results" && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 gap-4"
            >
              {drinks.map((drink) => (
                <DrinkCard key={drink.id} drink={drink} />
              ))}
            </motion.section>
          )}

          {state === "no-profile" && (
            <motion.section
              key="no-profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-8"
            >
              <div className="flex flex-col items-center gap-4">
                <SlidersHorizontal className="w-12 h-12 text-zinc-700" />
                <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-600 leading-tight">
                  Set your flavor
                  <br />
                  profile first.
                </h2>
              </div>
              <Link
                href="/dashboard/onboarding"
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-zinc-950 font-black text-sm uppercase tracking-widest rounded-xl active:scale-95 transition-all"
              >
                Set up tastes <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.section>
          )}

          {state === "no-results" && (
            <motion.section
              key="no-results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-600 leading-tight max-w-xs">
                No drinks match yet —<br />
                more venues coming soon.
              </h2>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <ClientBottomNav />
    </div>
  );
};
