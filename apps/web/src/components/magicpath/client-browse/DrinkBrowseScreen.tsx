'use client';
import * as React from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { ClientBottomNav } from '@/components/magicpath/shared/ClientBottomNav';
import { DrinkImage } from '@/components/magicpath/shared/DrinkImage';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDrinks } from '@/lib/hooks/useDrinks';
import type { components } from '@generated/api/schema.d.ts';

type ApiDrink = components['schemas']['Drink'];

interface Drink {
  id: string;
  name: string;
  category: string;
  price: string;
  imageUrl: string | null;
  gradient: string;
}

interface Category {
  id: string;
  label: string;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  cocktail: 'from-orange-500 to-red-600',
  beer: 'from-amber-500 to-yellow-600',
  spirit: 'from-violet-600 to-indigo-700',
  wine: 'from-rose-600 to-pink-800',
  shot: 'from-red-600 to-rose-900',
  mocktail: 'from-emerald-400 to-teal-600',
};

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'cocktail', label: 'Cocktail' },
  { id: 'beer', label: 'Beer' },
  { id: 'spirit', label: 'Spirit' },
  { id: 'wine', label: 'Wine' },
  { id: 'shot', label: 'Shot' },
  { id: 'mocktail', label: 'Mocktail' },
];

const DrinkCard = ({ drink }: { drink: Drink }) => (
  <Link href={`/dashboard/drinks/${drink.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="bg-zinc-900 rounded-[12px] overflow-hidden border border-zinc-800/50 group"
    >
      <DrinkImage
        src={drink.imageUrl}
        alt={drink.name}
        className="h-32 w-full"
        fallbackGradient={drink.gradient}
        sizes="(max-width: 640px) 50vw, 25vw"
      />
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{drink.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
            {drink.category}
          </span>
          <span className="text-zinc-400 text-[11px] font-medium">{drink.price}</span>
        </div>
      </div>
    </motion.div>
  </Link>
);

function toDrink(d: ApiDrink): Drink {
  return {
    id: d.id ?? '',
    name: d.name ?? 'Unknown',
    category: d.category ?? 'cocktail',
    price: `Q ${d.price?.toFixed(0) ?? '—'}`,
    imageUrl: d.imageUrls?.[0] ?? null,
    gradient: CATEGORY_GRADIENTS[d.category ?? ''] ?? 'from-zinc-700 to-zinc-900',
  };
}

export const DrinkBrowseScreen = () => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const loaderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { drinks: apiDrinks, hasMore, isLoading, isValidating, loadMore } = useDrinks(debouncedSearch, activeCategory);
  const drinks = apiDrinks.map(toDrink);

  React.useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore && !isValidating) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isValidating, loadMore]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30 pb-32">
      <header className="px-6 pt-12 pb-6">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-6xl font-black tracking-tighter text-white">
          BROWSE
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-sm mt-1 font-medium">
          Every drink in the graph.
        </motion.p>
      </header>

      <section className="px-6 mb-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search drinks, flavors..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[12px] py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-zinc-600 text-white"
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-6">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200',
                activeCategory === category.id
                  ? 'bg-orange-500 text-black scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6">
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {drinks.map(drink => <DrinkCard key={drink.id} drink={drink} />)}
          </AnimatePresence>
        </div>

        {!isLoading && drinks.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-500 font-medium italic">No drinks found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          </div>
        )}

        {/* Sentinel for intersection observer */}
        <div ref={loaderRef} className="mt-8 flex justify-center">
          {isValidating && (
            <Loader2 size={24} className="text-orange-500 animate-spin" />
          )}
          {!hasMore && drinks.length > 0 && (
            <p className="text-zinc-600 text-[11px] uppercase tracking-widest font-medium">
              Showing all {drinks.length} drinks
            </p>
          )}
        </div>
      </section>

      <ClientBottomNav />
    </div>
  );
};
