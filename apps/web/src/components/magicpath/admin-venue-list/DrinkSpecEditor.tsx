"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Beaker,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { NumericInput } from "@/components/ui/NumericInput";
import { cn } from "@/lib/utils";
import { SessionBar } from "./SessionBar";

export interface FlavorProfile {
  sweet: number;
  bitter: number;
  sour: number;
  smoky: number;
  citrus: number;
  herbal: number;
}

export interface EditorDrink {
  id: string;
  name: string;
  category: string;
  price: number;
  alcoholPercent: number;
  place: string;
  images: { id: string; url: string }[];
  flavors: FlavorProfile;
}

export const EDITOR_CATEGORIES = [
  "Cocktail",
  "Beer",
  "Spirit",
  "Wine",
  "Non-Alcoholic",
];

interface Props {
  drinks: EditorDrink[];
  userEmail: string;
  venueName: string;
  onBack: () => void;
  onUpdate: (index: number, updates: Partial<EditorDrink>) => void;
  footer: (currentDrink: EditorDrink, currentIndex: number) => React.ReactNode;
}

export const DrinkSpecEditor: React.FC<Props> = ({
  drinks,
  userEmail,
  venueName,
  onBack,
  onUpdate,
  footer,
}) => {
  const [currentDrinkIndex, setCurrentDrinkIndex] = React.useState(0);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const currentDrink = drinks[currentDrinkIndex];

  const handleNextDrink = () => {
    if (currentDrinkIndex < drinks.length - 1) {
      setCurrentDrinkIndex((i) => i + 1);
      setCurrentImageIndex(0);
    }
  };
  const handlePrevDrink = () => {
    if (currentDrinkIndex > 0) {
      setCurrentDrinkIndex((i) => i - 1);
      setCurrentImageIndex(0);
    }
  };
  const handleNextImage = () => {
    if (currentImageIndex < currentDrink.images.length - 1)
      setCurrentImageIndex((i) => i + 1);
  };
  const handlePrevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex((i) => i - 1);
  };

  const update = (updates: Partial<EditorDrink>) =>
    onUpdate(currentDrinkIndex, updates);

  const updateFlavor = (flavor: keyof FlavorProfile, value: number) =>
    update({ flavors: { ...currentDrink.flavors, [flavor]: value } });

  if (!currentDrink)
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans">
        <SessionBar
          type="admin"
          userName={userEmail.toUpperCase()}
          venueName={venueName.toUpperCase()}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            No drinks found for this venue.
          </p>
          <button
            onClick={onBack}
            className="text-amber-400 text-xs font-black uppercase tracking-widest underline underline-offset-4"
          >
            ← Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      <SessionBar
        type="admin"
        userName={userEmail.toUpperCase()}
        venueName={venueName.toUpperCase()}
      />

      <main className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Dual-Axis Carousel (65%) */}
        <section className="w-[65%] flex flex-col items-center justify-center p-8 bg-zinc-950 relative border-r border-zinc-900">
          <button
            onClick={onBack}
            className="absolute top-6 left-8 z-20 w-10 h-10 rounded-full bg-zinc-900/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 active:scale-95 transition-transform hover:border-amber-400/50 hover:text-amber-400"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Vertical Navigation Controls */}
          <div className="absolute top-12 z-10 flex flex-col items-center">
            <button
              onClick={handlePrevDrink}
              disabled={currentDrinkIndex === 0}
              suppressHydrationWarning
              className="flex flex-col items-center group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 group-hover:text-amber-400 transition-colors uppercase mb-1">
                PREV DRINK ↑
              </span>
              <div className="relative w-24 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden opacity-40 group-hover:opacity-70 transition-opacity">
                {currentDrinkIndex > 0 &&
                  drinks[currentDrinkIndex - 1].images[0] && (
                    // biome-ignore lint/performance/noImgElement: blob URLs and admin-only, next/image not needed
                    <img
                      src={drinks[currentDrinkIndex - 1].images[0].url}
                      alt="Previous drink"
                      className="w-full h-full object-cover"
                    />
                  )}
              </div>
            </button>
          </div>

          {/* Main Carousel Area */}
          <div className="relative w-full max-w-2xl h-[65vh] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentDrink.id}-${currentImageIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5"
              >
                {currentDrink.images[currentImageIndex] && (
                  // biome-ignore lint/performance/noImgElement: blob URLs and admin-only
                  <img
                    src={currentDrink.images[currentImageIndex].url}
                    alt={currentDrink.name}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-xs font-black tracking-widest text-white">
                    {currentImageIndex + 1} / {currentDrink.images.length}
                  </span>
                </div>

                <div className="absolute bottom-16 left-4 bg-amber-400 px-4 py-1.5 rounded-sm shadow-xl">
                  <span className="text-xs font-black tracking-widest text-black uppercase italic">
                    DRINK {currentDrinkIndex + 1} / {drinks.length}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 to-transparent p-4 flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-lg border border-white/10 transition-colors group">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
                      Add Image
                    </span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-lg border border-white/10 transition-colors group">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">
                      Remove
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handlePrevImage}
              disabled={currentImageIndex === 0}
              suppressHydrationWarning
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900/80 hover:bg-amber-400 border border-white/10 rounded-full flex items-center justify-center transition-all group disabled:opacity-0"
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:text-black" />
            </button>
            <button
              onClick={handleNextImage}
              disabled={currentImageIndex === currentDrink.images.length - 1}
              suppressHydrationWarning
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900/80 hover:bg-amber-400 border border-white/10 rounded-full flex items-center justify-center transition-all group disabled:opacity-0"
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:text-black" />
            </button>
          </div>

          <div className="absolute bottom-12 z-10 flex flex-col items-center">
            <button
              onClick={handleNextDrink}
              disabled={currentDrinkIndex === drinks.length - 1}
              suppressHydrationWarning
              className="flex flex-col items-center group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="relative w-24 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden opacity-40 group-hover:opacity-70 transition-opacity mb-1">
                {currentDrinkIndex < drinks.length - 1 &&
                  drinks[currentDrinkIndex + 1].images[0] && (
                    // biome-ignore lint/performance/noImgElement: blob URLs and admin-only
                    <img
                      src={drinks[currentDrinkIndex + 1].images[0].url}
                      alt="Next drink"
                      className="w-full h-full object-cover"
                    />
                  )}
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 group-hover:text-amber-400 transition-colors uppercase">
                NEXT DRINK ↓
              </span>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm">
            {currentDrink.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                  currentImageIndex === idx
                    ? "border-amber-400 scale-110 shadow-lg"
                    : "border-transparent opacity-50 hover:opacity-100",
                )}
              >
                {img && (
                  // biome-ignore lint/performance/noImgElement: blob URLs and admin-only
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL: Drink Spec (35%) */}
        <aside className="w-[35%] bg-zinc-900 flex flex-col h-full border-l border-white/5 shadow-2xl z-20">
          <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
            <div>
              <h2 className="text-2xl font-black text-amber-400 tracking-tighter uppercase italic leading-none">
                Drink Spec
              </h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Technical Data / Flavor DNA
              </p>
            </div>
            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center border border-white/5">
              <Beaker className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400 transition-colors">
                  Drink Name
                </label>
                <input
                  type="text"
                  value={currentDrink.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Category
                  </label>
                  <select
                    value={currentDrink.category}
                    onChange={(e) => update({ category: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 appearance-none"
                  >
                    {EDITOR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Alcohol %
                  </label>
                  <div className="relative">
                    <NumericInput
                      value={currentDrink.alcoholPercent}
                      onChange={(v) => update({ alcoholPercent: v })}
                      min={0}
                      max={100}
                      className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 pr-8 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-[10px]">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Price (Q)
                  </label>
                  <div className="relative">
                    <NumericInput
                      value={currentDrink.price}
                      onChange={(v) => update({ price: v })}
                      min={0}
                      className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 pl-8 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-black text-[10px]">
                      Q
                    </span>
                  </div>
                </div>
                {currentDrink.place && (
                  <div className="group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">
                      Source Venue
                    </label>
                    <div className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-600 rounded-lg px-4 py-3 text-sm font-bold">
                      {currentDrink.place}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Flavor Profile */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-400/70 tracking-[0.3em] uppercase italic">
                  Flavor Profile
                </h3>
                <Droplet className="w-3 h-3 text-amber-400/50" />
              </div>
              <div className="space-y-6">
                {(
                  Object.entries(currentDrink.flavors) as [
                    keyof FlavorProfile,
                    number,
                  ][]
                ).map(([flavor, val]) => (
                  <div key={flavor} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        {flavor}
                      </span>
                      <span className="text-[11px] font-black tabular-nums text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded leading-none">
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={val}
                      onChange={(e) =>
                        updateFlavor(flavor, parseFloat(e.target.value))
                      }
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — caller-provided actions */}
          <div className="shrink-0 p-8 bg-zinc-900 border-t border-white/5 space-y-3">
            {footer(currentDrink, currentDrinkIndex)}
          </div>
        </aside>
      </main>

      <div className="md:hidden fixed inset-0 z-[100] bg-zinc-950 flex flex-center p-8 text-center flex-col justify-center gap-4">
        <Beaker className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-black italic uppercase">
          Desktop Terminal Required
        </h2>
        <p className="text-sm text-zinc-500 font-medium">
          The Power Editor requires a larger display for precision mixology
          management.
        </p>
      </div>
    </div>
  );
};
