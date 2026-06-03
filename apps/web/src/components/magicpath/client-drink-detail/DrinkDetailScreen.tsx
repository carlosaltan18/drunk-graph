"use client";
import type { components } from "@generated/api/schema.d.ts";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { Drawer } from "vaul";
import { DrinkImage } from "@/components/magicpath/shared/DrinkImage";
import { useConsumption } from "@/lib/hooks/useConsumption";
import { useRecommendation } from "@/lib/hooks/useRecommendation";
import { cn } from "@/lib/utils";

type ApiDrink = components["schemas"]["Drink"];
type ApiRecommendation = components["schemas"]["Recommendation"];
type PagedConsumedDrink = components["schemas"]["PagedResultConsumedDrink"];

interface Props {
  drink?: ApiDrink | null;
  fallbackRecommendation?: ApiRecommendation;
  fallbackConsumption?: PagedConsumedDrink;
}

// Sub-components
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);
  return (
    <section className="relative w-full h-[320px] bg-zinc-900 overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((url, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 h-full relative"
            >
              <DrinkImage
                src={url}
                alt={`Drink photo ${index + 1}`}
                className="absolute inset-0 w-full h-full"
                sizes="100vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-950/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-6 bg-orange-500"
                : "w-1.5 bg-white/40",
            )}
          />
        ))}
      </div>
    </section>
  );
};
const FlavorIntensityDots = ({ intensity }: { intensity: number }) => {
  const totalDots = 5;
  const filledDots = Math.round(intensity * 5);
  return (
    <div className="flex gap-1 items-center">
      {Array.from({
        length: totalDots,
      }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full",
            i < filledDots ? "bg-orange-500" : "bg-zinc-700",
          )}
        />
      ))}
    </div>
  );
};
function toPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}
export const DrinkDetailScreen = ({
  drink,
  fallbackRecommendation,
  fallbackConsumption,
}: Props) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const sortedFlavors = Object.entries(drink?.flavors ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const { hasTried, logDrink, removeDrink } = useConsumption(
    fallbackConsumption?.elements,
  );
  const drinkLogged = hasTried(drink?.id ?? "");

  const { recommendation } = useRecommendation(
    drink?.id ?? "",
    fallbackRecommendation,
  );
  const scoreFlavor = recommendation?.scoreFlavor ?? 0;
  const scorePrice = recommendation?.scorePrice ?? 0;
  const scoreFinal = recommendation?.scoreFinal ?? 0;
  const hasScores = scoreFinal > 0;

  const handleLogDrink = () => setIsModalOpen(true);

  const confirmLog = async () => {
    if (!drink?.id) return;
    setIsModalOpen(false);
    await logDrink(drink.id, rating || 1);
  };

  const handleRemoveLog = async () => {
    if (!drink?.id) return;
    await removeDrink(drink.id);
  };
  return (
    <main className="flex flex-col w-full min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 overflow-x-hidden pb-24">
      {/* Top Image Section */}
      <div className="relative">
        <ImageCarousel
          images={(drink?.images ?? [])
            .map((img) => img.url ?? "")
            .filter(Boolean)}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-zinc-900/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Drink Info Section */}
      <section className="px-5 py-6 space-y-4">
        <div className="space-y-1">
          <motion.h1
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-4xl font-black leading-none tracking-tighter uppercase"
          >
            {drink?.name}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-bold tracking-widest uppercase rounded text-zinc-300">
              {drink?.category}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold tracking-widest rounded",
                (drink?.alcoholPct ?? 0) > 0
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-green-500/10 text-green-400",
              )}
            >
              {(drink?.alcoholPct ?? 0) > 0
                ? `${drink?.alcoholPct}% ABV`
                : "NON-ALCOHOLIC"}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-orange-500">
              Q {drink?.price}
            </p>
            <div className="flex items-center gap-1 text-zinc-500">
              <MapPin size={12} className="text-zinc-500" />
              <span className="text-[10px] uppercase tracking-wide">
                Served at:{" "}
                <span className="text-zinc-300 font-medium">
                  {drink?.placeName ?? drink?.placeId}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Match Score Section */}
      {hasScores && (
        <section className="px-5 py-2">
          <div className="bg-zinc-900 rounded-xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
                Why this was picked <Info size={10} />
              </p>
              <motion.p
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="text-xl font-black text-orange-500 italic"
              >
                {toPercent(scoreFinal)}% MATCH
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-tight">
                    Flavor Match
                  </span>
                  <span className="text-[10px] font-bold text-orange-500">
                    {toPercent(scoreFlavor)}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${toPercent(scoreFlavor)}%`,
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                    }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-tight">
                    Price Fit
                  </span>
                  <span className="text-[10px] font-bold text-green-500">
                    {toPercent(scorePrice)}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${toPercent(scorePrice)}%`,
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                      delay: 0.1,
                    }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Flavor Profile Section */}
      <section className="px-5 py-4">
        <div className="bg-zinc-900 rounded-xl p-5 border border-white/5 space-y-4">
          <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            Flavor Profile
          </p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {sortedFlavors.map(([name, intensity]) => (
              <div
                key={name}
                className="flex items-center justify-between group"
              >
                <span className="text-xs text-zinc-300 capitalize font-medium group-hover:text-orange-500 transition-colors">
                  {name}
                </span>
                <FlavorIntensityDots intensity={intensity} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 z-40">
        <div className="max-w-md mx-auto space-y-2">
          {!drinkLogged ? (
            <button
              onClick={handleLogDrink}
              className="w-full bg-orange-500 text-black font-black uppercase py-4 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-orange-400"
            >
              I Tried This
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          ) : (
            <div className="space-y-2 text-center">
              <button
                onClick={handleLogDrink}
                className="w-full bg-zinc-800 text-zinc-300 font-bold uppercase py-4 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                Tried{" "}
                <Check size={16} className="text-green-500" strokeWidth={3} />
              </button>
              <button
                onClick={handleRemoveLog}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest font-bold"
              >
                Remove from log
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Modal / Bottom Sheet */}
      <Drawer.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Drawer.Content className="bg-zinc-900 flex flex-col rounded-t-3xl h-[420px] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 outline-none">
            <div className="p-4 bg-zinc-900 rounded-t-3xl flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-800 mb-8" />
              <div className="max-w-md mx-auto px-4 space-y-8">
                <div className="space-y-2 text-center">
                  <Drawer.Title className="text-2xl font-black text-white uppercase tracking-tight">
                    How was it?
                  </Drawer.Title>
                  <Drawer.Description className="text-zinc-500 text-xs">
                    Your feedback improves your future recommendations.
                  </Drawer.Description>
                </div>

                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-90"
                    >
                      <Star
                        size={40}
                        className={cn(
                          "transition-colors",
                          rating >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-800",
                        )}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                    Rating is optional
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={confirmLog}
                    className="w-full bg-orange-500 text-black font-black uppercase py-4 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    Log it <ArrowRight size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </main>
  );
};
