"use client";
import type { components } from "@generated/api/schema.d.ts";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ClientBottomNav } from "@/components/magicpath/shared/ClientBottomNav";
import { DrinkImage } from "@/components/magicpath/shared/DrinkImage";
import { useConsumption } from "@/lib/hooks/useConsumption";
import { useStats } from "@/lib/hooks/useStats";
import { cn } from "@/lib/utils";

type ApiConsumedDrink = components["schemas"]["ConsumedDrink"];
type PagedConsumedDrink = components["schemas"]["PagedResultConsumedDrink"];
type UserStats = components["schemas"]["UserStats"];

interface Props {
  fallbackConsumption: PagedConsumedDrink;
  fallbackStats: UserStats;
}

const CATEGORY_COLORS: Record<string, string> = {
  cocktail: "from-orange-500 to-rose-600",
  beer: "from-amber-500 to-yellow-600",
  wine: "from-rose-600 to-pink-800",
  spirit: "from-violet-600 to-indigo-700",
  shot: "from-red-600 to-rose-900",
  mocktail: "from-emerald-400 to-teal-600",
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={10}
        className={cn(
          "fill-current",
          star <= rating ? "text-amber-400" : "text-zinc-700",
        )}
      />
    ))}
  </div>
);

export const DrunkGraphHistory = ({
  fallbackConsumption,
  fallbackStats,
}: Props) => {
  const router = useRouter();
  const { consumption, removeDrink } = useConsumption(
    fallbackConsumption.elements,
  );
  const { stats } = useStats(fallbackStats);
  const [swipedId, setSwipedId] = React.useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (swipedId === id) setSwipedId(null);
    removeDrink(id);
  };

  if (consumption.length === 0) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-3xl font-black tracking-tighter text-zinc-600 mb-4 italic">
            NOTHING LOGGED YET.
          </h2>
          <p className="text-zinc-600 text-sm mb-8 leading-relaxed">
            Start browsing and tap "I tried this" on drinks you've had.
          </p>
          <button
            onClick={() => router.push("/dashboard/browse")}
            className="group flex items-center gap-2 text-orange-500 font-black tracking-widest text-sm uppercase"
          >
            <span>BROWSE DRINKS</span>
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
        <ClientBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <header className="px-6 pt-12 pb-6 flex flex-col gap-1">
        <h1 className="text-5xl font-black tracking-tighter italic leading-none">
          YOUR LOG
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          {stats?.tried ?? "—"} {stats?.tried === 1 ? "drink" : "drinks"} tried.
        </p>
      </header>

      <div className="px-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-orange-500">{stats?.tried ?? "—"}</span>
            <span>tried</span>
          </div>
          <div className="w-[1px] h-3 bg-zinc-800" />
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-orange-500">{stats?.venues ?? "—"}</span>
            <span>venues</span>
          </div>
          <div className="w-[1px] h-3 bg-zinc-800" />
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-zinc-400">fav:</span>
            <span className="text-orange-500">{stats?.favCategory ?? "—"}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 pb-32 overflow-y-auto space-y-3">
        <AnimatePresence initial={false}>
          {consumption.map((drink) => (
            <motion.div
              key={drink.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <div
                className={cn(
                  "absolute inset-0 right-0 flex items-center justify-end pr-6 bg-red-600 rounded-xl transition-opacity duration-200",
                  swipedId === drink.id
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
                onClick={() => handleDelete(drink.id ?? "")}
              >
                <Trash2 className="text-white" size={24} />
              </div>

              <motion.div
                animate={{ x: swipedId === drink.id ? -80 : 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onPointerDown={() =>
                  setSwipedId((prev) =>
                    prev === drink.id ? null : (drink.id ?? null),
                  )
                }
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-4 relative z-10 touch-none active:bg-zinc-800 transition-colors"
              >
                <DrinkImage
                  src={drink.imageUrls?.[0] ?? null}
                  alt={drink.name ?? ""}
                  className="w-[60px] h-[60px] rounded-lg shrink-0"
                  fallbackGradient={
                    CATEGORY_COLORS[drink.category ?? ""] ??
                    "from-zinc-700 to-zinc-900"
                  }
                  sizes="60px"
                />

                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {drink.name}
                    </h3>
                    <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {drink.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium">
                    {drink.date} • {drink.placeName ?? drink.placeId ?? "—"}
                  </p>
                  <div className="mt-1">
                    <RatingStars rating={drink.rating ?? 0} />
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(drink.id ?? "");
                  }}
                  className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      <ClientBottomNav />
    </div>
  );
};
