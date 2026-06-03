"use client";
import type { components as adminComponents } from "@generated/admin-api/schema.d.ts";
import { Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAdminDrinks } from "@/lib/hooks/useAdminDrinks";
import { BrandButton } from "./BrandButton";
import {
  type EditorDrink,
  type FlavorProfile,
  DrinkSpecEditor,
} from "./DrinkSpecEditor";

type ApiDrink = adminComponents["schemas"]["Drink"];
type ApiPlace = adminComponents["schemas"]["Place"];
type PagedResultDrink = adminComponents["schemas"]["PagedResultDrink"];

interface EditorProps {
  place: ApiPlace;
  drinks: PagedResultDrink;
  userEmail: string;
}

function apiToEditorDrink(d: ApiDrink, placeName: string): EditorDrink {
  const flavors = d.flavors ?? {};
  return {
    id: d.id ?? "",
    name: d.name ?? "",
    category: d.category ?? "Cocktail",
    price: d.price ?? 0,
    alcoholPercent: d.alcoholPct ?? 0,
    place: placeName,
    images: (d.images ?? []).map((img) => ({
      id: img.id ?? "",
      url: img.url ?? "",
    })),
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

export const AdminDrinkEditor: React.FC<EditorProps> = ({
  place,
  drinks: pagedDrinks,
  userEmail,
}) => {
  const router = useRouter();
  const placeName = `${place.name ?? ""} — ${place.location ?? ""}`
    .trim()
    .replace(/^—\s*/, "");
  const apiDrinks: ApiDrink[] = pagedDrinks.elements ?? [];
  const { updateDrink: saveDrink, deleteDrink } = useAdminDrinks(
    place.id ?? null,
    pagedDrinks,
  );

  const [drinks, setDrinks] = React.useState<EditorDrink[]>(
    apiDrinks.map((d) => apiToEditorDrink(d, placeName)),
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null,
  );

  const handleUpdate = (index: number, updates: Partial<EditorDrink>) => {
    setDrinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleSave = async (drink: EditorDrink) => {
    if (!drink.id || isSaving) return;
    setIsSaving(true);
    await saveDrink(drink.id, {
      name: drink.name,
      category: drink.category,
      placeId: place.id ?? "",
      price: drink.price,
      alcoholPct: drink.alcoholPercent,
      flavors: { ...(drink.flavors as unknown as Record<string, number>) },
      imagePublicIds: drink.images.map((img) => img.id),
    });
    setSavedId(drink.id);
    setIsSaving(false);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <>
      <DrinkSpecEditor
        drinks={drinks}
        userEmail={userEmail}
        venueName={placeName}
        importHref={`/admin/places/${place.id}/import`}
        onBack={() => router.back()}
        onUpdate={handleUpdate}
        onAddFiles={async (index, files) => {
          const uploaded = await Promise.all(files.map(uploadToCloudinary));
          handleUpdate(index, {
            images: [...drinks[index].images, ...uploaded],
          });
        }}
        onRemoveImage={(index, imageIndex) => {
          handleUpdate(index, {
            images: drinks[index].images.filter((_, i) => i !== imageIndex),
          });
        }}
        footer={(currentDrink) => (
          <>
            <BrandButton
              variant="admin"
              size="xl"
              className="w-full"
              showArrow
              onClick={() => handleSave(currentDrink)}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : savedId === currentDrink.id
                  ? "Saved!"
                  : "Save Changes"}
            </BrandButton>
            <div className="flex gap-2">
              <Link
                href={`/admin/places/${place.id}/import`}
                className="flex items-center justify-center gap-2 flex-1 py-3 border border-zinc-700 rounded-xl hover:border-amber-400 hover:text-amber-400 text-zinc-500 transition-all text-[11px] font-black uppercase tracking-widest"
              >
                <UploadCloud className="w-4 h-4" />
                Upload New Drinks
              </Link>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(currentDrink.id)}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-700 rounded-xl hover:border-red-500 hover:text-red-500 text-zinc-500 transition-all text-[11px] font-black uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      />

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-black uppercase tracking-tight">
              Delete Drink?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently remove{" "}
              <span className="text-white font-bold">
                {drinks.find((d) => d.id === confirmDeleteId)?.name ??
                  "this drink"}
              </span>{" "}
              from the catalog. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-black uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirmDeleteId) return;
                await deleteDrink(confirmDeleteId);
                setConfirmDeleteId(null);
                setDrinks((prev) =>
                  prev.filter((d) => d.id !== confirmDeleteId),
                );
              }}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
