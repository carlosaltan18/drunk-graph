'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Trash2, Info, Beaker, Wine, Beer, Droplet, Coffee, UploadCloud, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SessionBar } from './SessionBar';
import { BrandButton } from './BrandButton';
import { cn } from '@/lib/utils';
import type { components as adminComponents } from '@generated/admin-api/schema.d.ts';
import Image from 'next/image';
import { useAdminDrinks } from '@/lib/hooks/useAdminDrinks';

// Types for our drink editor
interface FlavorProfile {
  sweet: number;
  bitter: number;
  sour: number;
  smoky: number;
  citrus: number;
  herbal: number;
}
interface Drink {
  id: string;
  name: string;
  category: string;
  price: number;
  alcoholPercent: number;
  place: string;
  images: string[];
  flavors: FlavorProfile;
}
const CATEGORIES = ['Cocktail', 'Beer', 'Spirit', 'Wine', 'Non-Alcoholic'];
type ApiDrink = adminComponents['schemas']['Drink'];
type ApiPlace = adminComponents['schemas']['Place'];
type PagedResultDrink = adminComponents['schemas']['PagedResultDrink'];

interface EditorProps {
  place: ApiPlace;
  drinks: PagedResultDrink;
  userEmail: string;
}

function apiToEditorDrink(d: ApiDrink, placeName: string): Drink {
  const flavors = d.flavors ?? {};
  return {
    id: d.id ?? '',
    name: d.name ?? '',
    category: d.category ?? 'Cocktail',
    price: d.price ?? 0,
    alcoholPercent: d.alcoholPct ?? 0,
    place: placeName,
    images: d.imageUrls ?? [],
    flavors: {
      sweet: flavors.sweet ?? 0,
      bitter: flavors.bitter ?? 0,
      sour: flavors.sour ?? 0,
      smoky: flavors.smoky ?? 0,
      citrus: flavors.citrus ?? 0,
      herbal: flavors.herbal ?? 0,
    },
  };
}

export const AdminDrinkEditor: React.FC<EditorProps> = ({ place, drinks: pagedDrinks, userEmail }) => {
  const router = useRouter();
  const placeName = `${place.name ?? ''} — ${place.location ?? ''}`.trim().replace(/^—\s*/, '')
  const apiDrinks: ApiDrink[] = pagedDrinks.elements ?? [];
  const { updateDrink: saveDrink } = useAdminDrinks(place.id ?? null, pagedDrinks);
  const [drinks, setDrinks] = React.useState<Drink[]>(
    apiDrinks.length ? apiDrinks.map(d => apiToEditorDrink(d, placeName)) : []
  );
  const [currentDrinkIndex, setCurrentDrinkIndex] = React.useState(0);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  const currentDrink = drinks[currentDrinkIndex];

  // Handlers
  const handleNextDrink = () => {
    if (currentDrinkIndex < drinks.length - 1) {
      setCurrentDrinkIndex(prev => prev + 1);
      setCurrentImageIndex(0);
    }
  };
  const handlePrevDrink = () => {
    if (currentDrinkIndex > 0) {
      setCurrentDrinkIndex(prev => prev - 1);
      setCurrentImageIndex(0);
    }
  };
  const handleNextImage = () => {
    if (currentImageIndex < currentDrink.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  const updateDrink = (updates: Partial<Drink>) => {
    const newDrinks = [...drinks];
    newDrinks[currentDrinkIndex] = {
      ...currentDrink,
      ...updates
    };
    setDrinks(newDrinks);
  };
  const updateFlavor = (flavor: keyof FlavorProfile, value: number) => {
    updateDrink({
      flavors: {
        ...currentDrink.flavors,
        [flavor]: value
      }
    });
  };

  const handleSave = async () => {
    if (!currentDrink.id || isSaving) return;
    setIsSaving(true);
    await saveDrink(currentDrink.id, {
      name: currentDrink.name,
      category: currentDrink.category,
      placeId: place.id ?? '',
      price: currentDrink.price,
      alcoholPct: currentDrink.alcoholPercent,
      flavors: currentDrink.flavors,
    });
    setSavedId(currentDrink.id);
    setIsSaving(false);
    setTimeout(() => setSavedId(null), 2000);
  };
  if (!currentDrink) return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans">
      <SessionBar type="admin" userName={userEmail.toUpperCase()} venueName={placeName.toUpperCase()} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No drinks found for this venue.</p>
        <button onClick={() => router.back()} className="text-amber-400 text-xs font-black uppercase tracking-widest underline underline-offset-4">← Back to venues</button>
      </div>
    </div>
  );

  return <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      <SessionBar type="admin" userName={userEmail.toUpperCase()} venueName={placeName.toUpperCase()} />

      <main className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Dual-Axis Carousel (65%) */}
        <section className="w-[65%] flex flex-col items-center justify-center p-8 bg-zinc-950 relative border-r border-zinc-900">
          <button onClick={() => router.back()} className="absolute top-6 left-8 z-20 w-10 h-10 rounded-full bg-zinc-900/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 active:scale-95 transition-transform hover:border-amber-400/50 hover:text-amber-400">
            <ArrowLeft size={18} />
          </button>
          
          {/* Vertical Navigation Controls */}
          <div className="absolute top-12 z-10 flex flex-col items-center">
            <button onClick={handlePrevDrink} disabled={currentDrinkIndex === 0} suppressHydrationWarning className="flex flex-col items-center group disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 group-hover:text-amber-400 transition-colors uppercase mb-1">
                PREV DRINK ↑
              </span>
              <div className="relative w-24 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden opacity-40 group-hover:opacity-70 transition-opacity">
                {currentDrinkIndex > 0 && drinks[currentDrinkIndex - 1].images[0] && <Image src={drinks[currentDrinkIndex - 1].images[0]} alt="Previous drink" fill sizes="96px" className="object-cover" />}
              </div>
            </button>
          </div>

          {/* Main Carousel Area */}
          <div className="relative w-full max-w-2xl h-[65vh] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={`${currentDrink.id}-${currentImageIndex}`} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5">
                {currentDrink.images[currentImageIndex] && <Image src={currentDrink.images[currentImageIndex]} alt={currentDrink.name} fill sizes="65vw" className="object-cover" priority />}

                {/* Overlays */}
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

                {/* Action Bar Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 to-transparent p-4 flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-lg border border-white/10 transition-colors group">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">Add Image</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 rounded-lg border border-white/10 transition-colors group">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">Remove</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Horizontal Nav Arrows */}
            <button onClick={handlePrevImage} disabled={currentImageIndex === 0} suppressHydrationWarning className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900/80 hover:bg-amber-400 border border-white/10 rounded-full flex items-center justify-center transition-all group disabled:opacity-0">
              <ChevronLeft className="w-6 h-6 text-white group-hover:text-black" />
            </button>
            <button onClick={handleNextImage} disabled={currentImageIndex === currentDrink.images.length - 1} suppressHydrationWarning className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900/80 hover:bg-amber-400 border border-white/10 rounded-full flex items-center justify-center transition-all group disabled:opacity-0">
              <ChevronRight className="w-6 h-6 text-white group-hover:text-black" />
            </button>
          </div>

          <div className="absolute bottom-12 z-10 flex flex-col items-center">
             <button onClick={handleNextDrink} disabled={currentDrinkIndex === drinks.length - 1} suppressHydrationWarning className="flex flex-col items-center group disabled:opacity-30 disabled:cursor-not-allowed">
              <div className="relative w-24 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden opacity-40 group-hover:opacity-70 transition-opacity mb-1">
                {currentDrinkIndex < drinks.length - 1 && drinks[currentDrinkIndex + 1].images[0] && <Image src={drinks[currentDrinkIndex + 1].images[0]} alt="Next drink" fill sizes="96px" className="object-cover" />}
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 group-hover:text-amber-400 transition-colors uppercase">
                NEXT DRINK ↓
              </span>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm">
            {currentDrink.images.map((img, idx) => <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={cn("w-12 h-12 rounded-md overflow-hidden border-2 transition-all", currentImageIndex === idx ? "border-amber-400 scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100")}>
                {img && <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="48px" className="object-cover" />}
              </button>)}
          </div>
        </section>

        {/* RIGHT PANEL: Drink Spec (35%) */}
        <aside className="w-[35%] bg-zinc-900 flex flex-col h-full border-l border-white/5 shadow-2xl relative z-20">
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

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide pb-32">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400 transition-colors">
                  Drink Name
                </label>
                <input type="text" value={currentDrink.name} onChange={e => updateDrink({
                name: e.target.value
              })} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Category
                  </label>
                  <select value={currentDrink.category} onChange={e => updateDrink({
                  category: e.target.value
                })} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50 appearance-none">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Alcohol %
                  </label>
                  <div className="relative">
                    <input type="number" value={currentDrink.alcoholPercent} onChange={e => updateDrink({
                    alcoholPercent: Number(e.target.value)
                  })} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-[10px]">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-amber-400">
                    Price (Q)
                  </label>
                  <div className="relative">
                    <input type="number" value={currentDrink.price} onChange={e => updateDrink({
                    price: Number(e.target.value)
                  })} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-black text-[10px]">Q</span>
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">
                    Source Venue
                  </label>
                  <div className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-600 rounded-lg px-4 py-3 text-sm font-bold flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    {currentDrink.place}
                  </div>
                </div>
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
                {(Object.entries(currentDrink.flavors) as [keyof FlavorProfile, number][]).map(([flavor, val]) => <div key={flavor} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{flavor}</span>
                      <span className="text-[11px] font-black tabular-nums text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded leading-none">{val.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={val} onChange={e => updateFlavor(flavor, parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                  </div>)}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 inset-x-0 p-8 bg-zinc-900 border-t border-white/5 space-y-3">
            <BrandButton variant="admin" size="xl" className="w-full" showArrow onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : savedId === currentDrink.id ? 'Saved!' : 'Save Changes'}
            </BrandButton>
            <Link href={`/admin/places/${place.id}/import`} className="flex items-center justify-center gap-2 w-full py-3 border border-zinc-700 rounded-xl hover:border-amber-400 hover:text-amber-400 text-zinc-500 transition-all text-[11px] font-black uppercase tracking-widest">
              <UploadCloud className="w-4 h-4" />
              Upload New Drinks
            </Link>
          </div>
        </aside>
      </main>

      {/* Mobile Overlay warning */}
      <div className="md:hidden fixed inset-0 z-[100] bg-zinc-950 flex flex-center p-8 text-center flex-col justify-center gap-4">
        <Beaker className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-black italic uppercase">Desktop Terminal Required</h2>
        <p className="text-sm text-zinc-500 font-medium">The Power Editor requires a larger display for precision mixology management.</p>
      </div>
    </div>;
};