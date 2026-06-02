"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { type StagedDrink, useAdminDrinks } from "@/lib/hooks/useAdminDrinks";
import { DrinkSpecEditor, type EditorDrink } from "@/components/magicpath/admin-venue-list/DrinkSpecEditor";
import { cn } from "@/lib/utils";
import { BrandButton } from "./BrandButton";
import { SessionBar } from "./SessionBar";

interface RawImage {
  id: string;
  file: File;
  previewUrl: string;
  isSelected: boolean;
}

interface Props {
  placeId: string;
  userEmail: string;
}

function stagedToEditorDrink(d: StagedDrink): EditorDrink {
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    price: d.price,
    alcoholPercent: d.alcoholPct,
    place: "",
    images: d.previewUrls.map((url) => ({ id: "", url })),
    flavors: {
      sweet: d.flavors.sweet ?? 0,
      bitter: d.flavors.bitter ?? 0,
      sour: d.flavors.sour ?? 0,
      smoky: d.flavors.smoky ?? 0,
      citrus: d.flavors.citrus ?? 0,
      herbal: d.flavors.herbal ?? 0,
    },
  };
}

export const AdminDrinkCreator: React.FC<Props> = ({ placeId, userEmail }) => {
  const { importBatch } = useAdminDrinks(placeId);
  const [images, setImages] = React.useState<RawImage[]>([]);
  const [drinks, setDrinks] = React.useState<StagedDrink[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [imported, setImported] = React.useState(false);
  const [reviewing, setReviewing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const selectedCount = images.filter((img) => img.isSelected).length;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: RawImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        isSelected: false,
      }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const toggleSelection = (id: string) =>
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, isSelected: !img.isSelected } : img,
      ),
    );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const stageSelectedAsDrink = () => {
    const selected = images.filter((img) => img.isSelected);
    if (selected.length === 0) return;
    setDrinks((prev) => [
      ...prev,
      {
        id: `drink-${Date.now()}`,
        name: `DRINK #${prev.length + 1}`,
        previewUrls: selected.map((img) => img.previewUrl),
        files: selected.map((img) => img.file),
        status: "pending",
        category: "Cocktail",
        price: 0,
        alcoholPct: 0,
        flavors: { sweet: 0, bitter: 0, sour: 0, smoky: 0, citrus: 0, herbal: 0 },
      },
    ]);
    setImages((prev) => prev.filter((img) => !img.isSelected));
  };

  const removeStagedDrink = (id: string) =>
    setDrinks((prev) => prev.filter((d) => d.id !== id));

  const renameDrink = (id: string, name: string) =>
    setDrinks((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));

  const handleEditorUpdate = (index: number, updates: Partial<EditorDrink>) => {
    setDrinks((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.alcoholPercent !== undefined && { alcoholPct: updates.alcoholPercent }),
        ...(updates.flavors !== undefined && { flavors: updates.flavors as unknown as Record<string, number> }),
      };
      return next;
    });
  };

  const handleImport = async () => {
    if (drinks.length === 0 || importing) return;
    setImporting(true);
    const onProgress = (id: string, status: StagedDrink["status"]) =>
      setDrinks((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d)),
      );
    const ok = await importBatch(drinks, onProgress);
    setImporting(false);
    if (ok) {
      setReviewing(false);
      setImported(true);
    }
  };

  if (reviewing) {
    return (
      <DrinkSpecEditor
        drinks={drinks.map(stagedToEditorDrink)}
        userEmail={userEmail}
        venueName={placeId}
        onBack={() => setReviewing(false)}
        onUpdate={handleEditorUpdate}
        onAddFiles={async (index, files) => {
          const newUrls = files.map((f) => URL.createObjectURL(f));
          setDrinks((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              files: [...next[index].files, ...files],
              previewUrls: [...next[index].previewUrls, ...newUrls],
            };
            return next;
          });
        }}
        onRemoveImage={(index, imageIndex) => {
          setDrinks((prev) => {
            const next = [...prev];
            const drink = next[index];
            const urlToRevoke = drink.previewUrls[imageIndex];
            if (urlToRevoke?.startsWith("blob:")) URL.revokeObjectURL(urlToRevoke);
            next[index] = {
              ...drink,
              files: drink.files.filter((_, i) => i !== imageIndex),
              previewUrls: drink.previewUrls.filter((_, i) => i !== imageIndex),
            };
            return next;
          });
        }}
        footer={() => (
          <BrandButton
            variant="admin"
            size="xl"
            className="w-full"
            showArrow
            disabled={importing}
            onClick={handleImport}
          >
            {importing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Importing…
              </span>
            ) : (
              `Import ${drinks.length} ${drinks.length === 1 ? "Drink" : "Drinks"}`
            )}
          </BrandButton>
        )}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-amber-400 selection:text-black">
      <SessionBar
        type="admin"
        userName={userEmail.toUpperCase()}
        venueName={placeId.toUpperCase()}
      />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <nav className="flex items-center gap-2 mb-4">
            <Link
              href="/admin/dashboard"
              className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-zinc-300 transition-colors"
            >
              Venues
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <Link
              href={`/admin/places/${placeId}`}
              className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-zinc-300 transition-colors"
            >
              {placeId}
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">
              Upload Drinks
            </span>
          </nav>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
            Batch <span className="text-amber-400">Upload</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-xs mt-2 tracking-widest">
            Drop images, group them into drinks. Build the catalog.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Dropzone & Raw Images */}
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div
                className="group relative border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 p-12 flex flex-col items-center justify-center transition-all hover:border-amber-400/50 hover:bg-amber-400/[0.02] cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
              >
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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
                <AnimatePresence initial={false}>
                  {images.map((img) => (
                    <motion.div
                      layout
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      className={cn(
                        "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        img.isSelected
                          ? "border-amber-400 ring-4 ring-amber-400/20"
                          : "border-zinc-800 hover:border-zinc-600",
                      )}
                      onClick={() => toggleSelection(img.id)}
                    >
                      <img
                        src={img.previewUrl}
                        alt="Uploaded"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className={cn(
                          "absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          img.isSelected
                            ? "bg-amber-400 border-amber-400"
                            : "bg-black/50 border-white/20",
                        )}
                      >
                        {img.isSelected && (
                          <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded bg-black/50 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:border-red-500"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Right: Staging & Progress */}
          <aside className="lg:col-span-4 space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <h2 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em]">
                  Zone 2 / Staging
                </h2>
              </div>

              <div
                className={cn(
                  "p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all",
                  selectedCount > 0
                    ? "border-amber-400/30 bg-amber-400/[0.01]"
                    : "opacity-40 grayscale pointer-events-none",
                )}
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Selection
                    </span>
                    <span className="text-3xl font-black italic tracking-tighter uppercase">
                      {selectedCount}{" "}
                      <span className="text-zinc-600">Images</span>
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-800">
                    <ImageIcon className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>

                <BrandButton
                  variant="admin"
                  size="lg"
                  className="w-full"
                  showArrow
                  onClick={stageSelectedAsDrink}
                  disabled={selectedCount === 0}
                >
                  Create Drink
                </BrandButton>

                <p className="text-[9px] font-bold text-zinc-600 uppercase text-center mt-4 tracking-widest leading-relaxed">
                  Selected images will be grouped as a single entity for
                  metadata tagging.
                </p>
              </div>
            </section>

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
                  {drinks.map((drink) => (
                    <motion.div
                      key={drink.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                      className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex -space-x-3 shrink-0">
                          {drink.previewUrls.slice(0, 3).map((url, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded border-2 border-zinc-900 overflow-hidden bg-zinc-800"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {drink.previewUrls.length > 3 && (
                            <div className="w-10 h-10 rounded border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">
                              +{drink.previewUrls.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingId === drink.id ? (
                            <input
                              autoFocus
                              value={drink.name}
                              onChange={(e) => renameDrink(drink.id, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                              className="w-full bg-zinc-800 border border-amber-400/50 rounded px-2 py-0.5 text-xs font-black uppercase tracking-tight text-white outline-none"
                            />
                          ) : (
                            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-300 truncate">
                              {drink.name}
                            </h3>
                          )}
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            {drink.previewUrls.length} assets
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {drink.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        )}
                        {drink.status === "done" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {drink.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        {drink.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingId(drink.id)}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStagedDrink(drink.id)}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {drinks.length === 0 && (
                  <div className="py-8 border-2 border-dashed border-zinc-900 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                      No drinks staged yet
                    </span>
                  </div>
                )}
              </div>

              {drinks.length > 0 && !imported && (
                <BrandButton
                  variant="admin"
                  size="lg"
                  className="w-full"
                  showArrow
                  onClick={() => setReviewing(true)}
                >
                  Review & Import
                </BrandButton>
              )}

              {imported && (
                <div className="flex items-center gap-3 p-4 bg-emerald-950/50 border border-emerald-800 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    {drinks.length} drinks imported successfully
                  </span>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};
