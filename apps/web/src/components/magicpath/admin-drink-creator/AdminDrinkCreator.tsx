'use client';
import * as React from 'react';
import { UploadCloud, X, Check, ChevronRight, Image as ImageIcon, PlusCircle, MoreVertical, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionBar } from './SessionBar';
import { BrandButton } from './BrandButton';
import { cn } from '@/lib/utils';

// --- Types ---

interface RawImage {
  id: string;
  url: string;
  isSelected: boolean;
}
interface DrinkInProgress {
  id: string;
  name: string;
  images: string[];
}


// --- Components ---

interface Props {
  placeId: string;
  userEmail: string;
}

export const AdminDrinkCreator: React.FC<Props> = ({ placeId, userEmail }) => {
  const [images, setImages] = React.useState<RawImage[]>([]);
  const [drinks, setDrinks] = React.useState<DrinkInProgress[]>([]);
  const selectedCount = images.filter(img => img.isSelected).length;
  const toggleImageSelection = (id: string) => {
    setImages(prev => prev.map(img => img.id === id ? {
      ...img,
      isSelected: !img.isSelected
    } : img));
  };
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };
  const createDrink = () => {
    if (selectedCount === 0) return;
    const selectedImages = images.filter(img => img.isSelected);
    const newDrink: DrinkInProgress = {
      id: `drink-${Date.now()}`,
      name: `DRINK #${drinks.length + 1}`,
      images: selectedImages.map(img => img.url)
    };
    setDrinks(prev => [...prev, newDrink]);
    setImages(prev => prev.filter(img => !img.isSelected));
  };
  return <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* Session Bar */}
      <SessionBar type="admin" userName={userEmail.toUpperCase()} venueName={placeId.toUpperCase()} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb & Title */}
        <header className="mb-12">
          <nav className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Venues</span>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{placeId}</span>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Upload Drinks</span>
          </nav>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
            Batch <span className="text-amber-400">Upload</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs mt-2 tracking-widest">
            Drop images, group them into drinks. Build the catalog.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Dropzone & Raw Images */}
          <section className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em]">
                  Zone 1 / Raw Images
                </h2>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Total Uploaded: {images.length}
                </span>
              </div>

              {/* Dropzone */}
              <div className="group relative border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 p-12 flex flex-col items-center justify-center transition-all hover:border-amber-400/50 hover:bg-amber-400/[0.02] cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#27272a_1px,_transparent_1px)] bg-[length:16px_16px] opacity-20" />
                <UploadCloud className="w-12 h-12 text-zinc-700 group-hover:text-amber-400 mb-4 transition-colors" />
                <div className="text-center relative z-10">
                  <span className="block text-sm font-black text-white uppercase tracking-tighter mb-1">
                    Drop images here or click to browse
                  </span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    PNG, JPG or WEBP (Max 5MB each)
                  </span>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
                <AnimatePresence initial={false}>
                  {images.map(img => <motion.div layout key={img.id} initial={{
                  opacity: 0,
                  scale: 0.8
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: {
                    duration: 0.2
                  }
                }} className={cn("group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer", img.isSelected ? "border-amber-400 ring-4 ring-amber-400/20" : "border-zinc-800 hover:border-zinc-600")} onClick={() => toggleImageSelection(img.id)}>
                      <img src={img.url} alt="Uploaded" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      
                      {/* Checkbox Overlay */}
                      <div className={cn("absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-colors", img.isSelected ? "bg-amber-400 border-amber-400" : "bg-black/50 border-white/20")}>
                        {img.isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                      </div>

                      {/* Remove Button */}
                      <button onClick={e => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }} className="absolute top-2 right-2 w-5 h-5 rounded bg-black/50 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:border-red-500">
                        <X className="w-3 h-3 text-white" />
                      </button>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">IMG_{img.id.split('-')[1]}</span>
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Right Column: Staging & Progress */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Zone 2: Staging Area */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <h2 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em]">
                  Zone 2 / Staging
                </h2>
              </div>

              <div className={cn("p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all", selectedCount > 0 ? "border-amber-400/30 bg-amber-400/[0.01]" : "opacity-40 grayscale pointer-events-none")}>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Selection</span>
                    <span className="text-3xl font-black italic tracking-tighter uppercase">
                      {selectedCount} <span className="text-zinc-600">Images</span>
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-800">
                    <ImageIcon className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>

                <BrandButton variant="admin" size="lg" className="w-full" showArrow onClick={createDrink} disabled={selectedCount === 0}>
                  Create Drink
                </BrandButton>
                
                <p className="text-[9px] font-bold text-zinc-600 uppercase text-center mt-4 tracking-widest leading-relaxed">
                  Selected images will be grouped as a single entity for metadata tagging.
                </p>
              </div>
            </section>

            {/* Zone 3: Created Drinks */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Zone 3 / Progress
                </h2>
                <span className="text-[10px] font-bold text-zinc-600 uppercase">
                  {drinks.length} Drinks
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {drinks.map(drink => <motion.div key={drink.id} initial={{
                  opacity: 0,
                  x: 20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          {drink.images.slice(0, 3).map((url, idx) => <div key={idx} className="w-10 h-10 rounded border-2 border-zinc-900 overflow-hidden bg-zinc-800 shrink-0">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>)}
                          {drink.images.length > 3 && <div className="w-10 h-10 rounded border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 z-10">
                              +{drink.images.length - 3}
                            </div>}
                        </div>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-tight text-zinc-300 group-hover:text-white transition-colors">
                            {drink.name}
                          </h3>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            {drink.images.length} Assets Attached
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit Spec Link Indicator */}
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-0 transition-all px-4 pointer-events-none">
                         <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
                           Edit Spec →
                         </span>
                      </div>
                    </motion.div>)}
                </AnimatePresence>

                <button className="w-full py-4 border-2 border-dashed border-zinc-900 rounded-xl flex items-center justify-center gap-2 text-zinc-700 hover:text-zinc-500 hover:border-zinc-800 transition-all group">
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add to another slot</span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="fixed bottom-8 left-8 p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg hidden xl:block">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center">
            <span className="text-black font-black text-xs">?</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tighter">System Help</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">CMD + U to Quick Upload</div>
          </div>
        </div>
      </div>
    </div>;
};