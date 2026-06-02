"use client";
import type { components as adminComponents } from "@generated/admin-api/schema.d.ts";
import { UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
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
    images: (d.images ?? []).map((img) => ({ id: img.id ?? "", url: img.url ?? "" })),
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
  const { updateDrink: saveDrink } = useAdminDrinks(
    place.id ?? null,
    pagedDrinks,
  );

  const [drinks, setDrinks] = React.useState<EditorDrink[]>(
    apiDrinks.map((d) => apiToEditorDrink(d, placeName)),
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);

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
    <DrinkSpecEditor
      drinks={drinks}
      userEmail={userEmail}
      venueName={placeName}
      onBack={() => router.back()}
      onUpdate={handleUpdate}
      onImagesChange={(index, images) => handleUpdate(index, { images })}
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
          <Link
            href={`/admin/places/${place.id}/import`}
            className="flex items-center justify-center gap-2 w-full py-3 border border-zinc-700 rounded-xl hover:border-amber-400 hover:text-amber-400 text-zinc-500 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Drinks
          </Link>
        </>
      )}
    />
  );
};
