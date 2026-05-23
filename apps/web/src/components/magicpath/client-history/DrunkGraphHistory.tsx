'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Star, ChevronRight, Plus } from 'lucide-react';
import { ClientBottomNav } from '@/components/magicpath/shared/ClientBottomNav';
import { DrinkImage } from '@/components/magicpath/shared/DrinkImage';
import { cn } from '@/lib/utils';
import type { components } from '@generated/api/schema.d.ts';
import { clientApi } from '@/lib/api/client';

type ApiDrink = components['schemas']['Drink'];

// --- Types ---

interface Drink {
  id: string;
  name: string;
  category: 'cocktail' | 'beer' | 'wine' | 'spirit';
  date: string;
  rating: number;
  venue: string;
  color: string;
  imageUrl: string | null;
}

interface Props {
  drinks: ApiDrink[];
}

const CATEGORY_COLORS: Record<string, string> = {
  cocktail: 'from-orange-500 to-rose-600',
  beer: 'from-amber-500 to-yellow-600',
  wine: 'from-rose-600 to-pink-800',
  spirit: 'from-violet-600 to-indigo-700',
  shot: 'from-red-600 to-rose-900',
  mocktail: 'from-emerald-400 to-teal-600',
};

// --- Sub-components ---

const RatingStars = ({
  rating
}: {
  rating: number;
}) => {
  return <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => <Star key={star} size={10} className={cn("fill-current", star <= rating ? "text-amber-400" : "text-zinc-700")} />)}
    </div>;
};

// --- Main Component ---

export const DrunkGraphHistory = ({ drinks: apiDrinks }: Props) => {
  const [drinks, setDrinks] = React.useState<Drink[]>(() =>
    apiDrinks.map(d => ({
      id: d.id ?? '',
      name: d.name ?? 'Unknown',
      category: (d.category ?? 'cocktail') as Drink['category'],
      date: '',
      rating: d.rating ?? 0,
      venue: d.placeId ?? '—',
      color: CATEGORY_COLORS[d.category ?? ''] ?? 'from-zinc-700 to-zinc-900',
      imageUrl: d.imageUrls?.[0] ?? null,
    }))
  );
  const [isSwipedId, setIsSwipedId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDrinks(prev => prev.filter(d => d.id !== id));
    if (isSwipedId === id) setIsSwipedId(null);
    await clientApi.DELETE('/api/users/me/consumption/{drinkId}', {
      params: { path: { drinkId: id } },
    });
  };
  const stats = React.useMemo(() => {
    const venues = new Set(drinks.map(d => d.venue)).size;
    const categories = drinks.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
    return {
      tried: drinks.length,
      venues,
      fav: favCategory
    };
  }, [drinks]);
  if (drinks.length === 0) {
    return <div className="flex flex-col h-full bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-3xl font-black tracking-tighter text-zinc-600 mb-4 italic">
            NOTHING LOGGED YET.
          </h2>
          <p className="text-zinc-600 text-sm mb-8 leading-relaxed">
            <span>Start browsing and tap "I tried this" on drinks you've had.</span>
          </p>
          <button className="group flex items-center gap-2 text-orange-500 font-black tracking-widest text-sm uppercase">
            <span>BROWSE DRINKS</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <ClientBottomNav />
      </div>;
  }
  return <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Header Section */}
      <header className="px-6 pt-12 pb-6 flex flex-col gap-1">
        <h1 className="text-5xl font-black tracking-tighter italic leading-none">
          YOUR LOG
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          {stats.tried} {stats.tried === 1 ? 'drink' : 'drinks'} tried.
        </p>
      </header>

      {/* Stats Strip */}
      <div className="px-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-orange-500">{stats.tried}</span>
            <span>tried</span>
          </div>
          <div className="w-[1px] h-3 bg-zinc-800" />
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-orange-500">{stats.venues}</span>
            <span>venues</span>
          </div>
          <div className="w-[1px] h-3 bg-zinc-800" />
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="text-zinc-400">fav:</span>
            <span className="text-orange-500">{stats.fav}</span>
          </div>
        </div>
      </div>

      {/* Drink Log List */}
      <main className="flex-1 px-6 pb-32 overflow-y-auto space-y-3">
        <AnimatePresence initial={false}>
          {drinks.map(drink => <motion.div key={drink.id} layout initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="relative group">
              {/* Delete Zone */}
              <div className={cn("absolute inset-0 right-0 flex items-center justify-end pr-6 bg-red-600 rounded-xl transition-opacity duration-200", isSwipedId === drink.id ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleDelete(drink.id)}>
                <Trash2 className="text-white" size={24} />
              </div>

              {/* Main Card Content */}
              <motion.div animate={{
            x: isSwipedId === drink.id ? -80 : 0
          }} transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }} onPointerDown={() => {
            // Interaction to toggle swipe for demo
            if (isSwipedId === drink.id) {
              setIsSwipedId(null);
            } else {
              setIsSwipedId(drink.id);
            }
          }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-4 relative z-10 touch-none active:bg-zinc-800 transition-colors">
                {/* Thumbnail */}
                <DrinkImage
                  src={drink.imageUrl}
                  alt={drink.name}
                  className="w-[60px] h-[60px] rounded-lg shrink-0"
                  fallbackGradient={drink.color}
                  sizes="60px"
                />

                {/* Details */}
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
                    {drink.date} • {drink.venue}
                  </p>
                  <div className="mt-1">
                    <RatingStars rating={drink.rating} />
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex flex-col items-end gap-2">
                  <button onClick={e => {
                e.stopPropagation();
                handleDelete(drink.id);
              }} className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>)}
        </AnimatePresence>

        {/* Add floating action button for "I tried this" (extra touch) */}
        <div className="h-4" />
      </main>

      <button className="fixed right-6 bottom-24 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-transform z-20">
        <Plus className="text-zinc-950" size={28} strokeWidth={3} />
      </button>

      {/* Bottom Nav */}
      <ClientBottomNav />
    </div>;
};