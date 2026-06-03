"use client";
import type { components } from "@generated/api/schema.d.ts";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { NumericInput } from "@/components/ui/NumericInput";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { useTastes } from "@/lib/hooks/useTastes";
import { cn } from "@/lib/utils";

type ApiFlavor = components["schemas"]["Flavor"];

interface Props {
  flavors: ApiFlavor[];
  initialTastes?: Record<string, number>;
  initialBudget?: number;
  initialPrefersAlcohol?: boolean;
}

interface Flavor {
  id: string;
  name: string;
  description: string;
}
const FlavorSlider = ({
  flavor,
  value,
  onChange,
}: {
  flavor: Flavor;
  value: number;
  onChange: (val: number) => void;
}) => {
  return (
    <div className="flex flex-col space-y-3 py-4 border-b border-zinc-900/50">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-white font-black text-sm tracking-tight uppercase">
            {flavor.name}
          </span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            {flavor.description}
          </span>
        </div>
        <div
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors duration-300",
            value > 0
              ? "bg-orange-500/10 text-orange-500"
              : "bg-zinc-900 text-zinc-600",
          )}
        >
          {value.toFixed(1)}
        </div>
      </div>

      <div className="relative h-6 flex items-center group">
        {/* Track Background */}
        <div className="absolute w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            initial={{
              width: 0,
            }}
            animate={{
              width: `${value * 100}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        </div>

        {/* Invisible Input for actual sliding */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Visible Thumb */}
        <motion.div
          className="absolute w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-lg pointer-events-none z-20"
          animate={{
            left: `calc(${value * 100}% - 8px)`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      </div>
    </div>
  );
};
export const FlavorProfileSetup = ({
  flavors: apiFlavors,
  initialTastes = {},
  initialBudget = 150,
  initialPrefersAlcohol = true,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back");
  const { addTaste } = useTastes();
  const { updatePreferences } = usePreferences();
  const flavors: Flavor[] = apiFlavors.map((f) => ({
    id: f.name ?? "",
    name: (f.name ?? "").toUpperCase(),
    description: f.description ?? "",
  }));

  const [flavorValues, setFlavorValues] = React.useState<
    Record<string, number>
  >(Object.fromEntries(flavors.map((f) => [f.id, initialTastes[f.id] ?? 0])));
  const [maxSpend, setMaxSpend] = React.useState(initialBudget);
  const [isNonAlcoholic, setIsNonAlcoholic] = React.useState(
    !initialPrefersAlcohol,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFlavorChange = (id: string, val: number) => {
    setFlavorValues((prev) => ({ ...prev, [id]: val }));
  };

  const markOnboarded = () => {
    document.cookie = "onboarded=true; path=/; max-age=31536000; SameSite=Lax";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const activeTastes = Object.entries(flavorValues).filter(([, v]) => v > 0);
    await Promise.all([
      ...activeTastes.map(([flavor, weight]) => addTaste(flavor, weight)),
      updatePreferences({
        budgetMax: maxSpend || undefined,
        prefersAlcohol: !isNonAlcoholic,
      }),
    ]);
    markOnboarded();
    router.push(backUrl ?? "/dashboard");
  };
  return (
    <div className="min-h-screen w-full max-w-[402px] mx-auto bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-orange-500 selection:text-black">
      {/* Container with spacing */}
      <div className="px-6 pt-12 pb-32">
        {/* Header */}
        <header className="mb-10">
          {backUrl && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push(backUrl)}
              className="flex items-center gap-1.5 mb-6 text-zinc-500 text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </motion.button>
          )}
          <motion.span
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="block text-zinc-600 font-bold text-[10px] tracking-[0.2em] uppercase mb-4"
          >
            STEP 1 OF 1 · FLAVOR PROFILE
          </motion.span>

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="text-5xl font-black leading-[0.9] tracking-tighter uppercase mb-4"
          >
            WHAT <br />
            MOVES YOU?
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="text-zinc-500 text-sm font-medium leading-tight max-w-[280px]"
          >
            Move the sliders for flavors you enjoy. <br />
            Skip what you don't know.
          </motion.p>
        </header>

        {/* Sliders Grid */}
        <motion.div
          className="space-y-2 mb-12"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
          }}
        >
          {flavors.map((flavor) => (
            <FlavorSlider
              key={flavor.id}
              flavor={flavor}
              value={flavorValues[flavor.id]}
              onChange={(val) => handleFlavorChange(flavor.id, val)}
            />
          ))}
        </motion.div>

        {/* Budget Section */}
        <section className="mb-10">
          <h2 className="text-zinc-400 font-bold text-[10px] tracking-[0.1em] uppercase mb-4">
            MAX SPEND PER DRINK
          </h2>
          <div className="relative flex items-center group">
            <span className="absolute left-4 text-orange-500 font-black text-lg group-focus-within:scale-110 transition-transform">
              Q
            </span>
            <NumericInput
              value={maxSpend}
              onChange={setMaxSpend}
              min={0}
              placeholder="150"
              className="w-full bg-zinc-900 border-none rounded-xl py-4 pl-10 pr-4 text-white font-black text-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-700"
            />
          </div>
        </section>

        {/* Preference Toggle */}
        <section className="mb-12">
          <button
            onClick={() => setIsNonAlcoholic(!isNonAlcoholic)}
            className="flex items-center justify-between w-full p-4 bg-zinc-900 rounded-xl active:scale-[0.98] transition-transform"
          >
            <span className="text-zinc-200 font-bold text-sm tracking-tight uppercase">
              I PREFER NON-ALCOHOLIC
            </span>
            <div
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                isNonAlcoholic ? "bg-orange-500" : "bg-zinc-800",
              )}
            >
              <motion.div
                animate={{
                  x: isNonAlcoholic ? 24 : 4,
                }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </div>
          </button>
        </section>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-50">
          <div className="max-w-[402px] mx-auto flex flex-col items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black text-sm uppercase py-5 rounded-xl shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-2 tracking-widest"
            >
              {isSubmitting ? "Saving..." : "GET MY RECOMMENDATIONS"}
              {!isSubmitting && <ArrowRight className="w-5 h-5 stroke-[3px]" />}
            </motion.button>

            <button
              onClick={() => {
                markOnboarded();
                router.push(backUrl ?? "/dashboard");
              }}
              className="text-zinc-600 text-xs font-bold underline underline-offset-4 tracking-wider uppercase hover:text-zinc-400 transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
