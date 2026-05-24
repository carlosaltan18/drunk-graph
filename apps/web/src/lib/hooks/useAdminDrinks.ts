"use client";
import type { components } from "@generated/admin-api/schema.d.ts";
import { toast } from "sonner";
import useSWR from "swr";
import { adminClientApi } from "@/lib/api/admin-client";

type ApiDrink = components["schemas"]["Drink"];
type DrinkEditRequest = components["schemas"]["DrinkEditRequest"];
type DrinkItemRequest = components["schemas"]["DrinkItemRequest"];
type PagedDrinks = components["schemas"]["PagedResultDrink"];

interface UploadSignResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

type AdminDrinksKey = [route: string, placeId: string | null];

export interface StagedDrink {
  id: string;
  name: string;
  files: File[];
  previewUrls: string[];
  status: "pending" | "uploading" | "done" | "error";
}

async function uploadToCloudinary(
  file: File,
  sig: UploadSignResponse,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const json = await res.json();
  return json.public_id as string;
}

function fetchAdminDrinks([, placeId]: AdminDrinksKey): Promise<PagedDrinks> {
  return adminClientApi
    .GET("/api/admin/drinks", {
      params: { query: { placeId: placeId ?? undefined } },
    })
    .then((r) => {
      if (!r.response.ok)
        throw new Error(`${r.response.status}: ${r.response.statusText}`);
      if (!r.data) throw new Error("Empty response from /api/admin/drinks");
      return r.data;
    });
}

export function useAdminDrinks(
  placeId: string | null,
  fallbackData?: PagedDrinks,
) {
  const key: AdminDrinksKey = ["/api/admin/drinks", placeId];

  const { data, mutate, isLoading } = useSWR<PagedDrinks>(
    key,
    fetchAdminDrinks,
    { fallbackData },
  );

  const elements: ApiDrink[] = data?.elements ?? [];

  const updateDrink = async (id: string, request: DrinkEditRequest) => {
    const optimistic: PagedDrinks = {
      ...data,
      elements: elements.map((d) => (d.id === id ? { ...d, ...request } : d)),
    };
    void mutate(optimistic, { revalidate: false });
    try {
      const res = await adminClientApi.PUT("/api/admin/drinks/{id}", {
        params: { path: { id } },
        body: request,
      });
      if (!res.response.ok)
        throw new Error(`${res.response.status}: ${res.response.statusText}`);
      void mutate();
    } catch (err) {
      void mutate();
      toast.error(err instanceof Error ? err.message : "Failed to save drink");
    }
  };

  const importBatch = async (
    stagedDrinks: StagedDrink[],
    onProgress: (id: string, status: StagedDrink["status"]) => void,
  ): Promise<boolean> => {
    try {
      const sigRes = await adminClientApi.POST("/api/admin/uploads/sign", {});
      if (!sigRes.response.ok)
        throw new Error(
          `${sigRes.response.status}: ${sigRes.response.statusText}`,
        );
      if (!sigRes.data)
        throw new Error("Empty response from /api/admin/uploads/sign");
      const sig = sigRes.data as UploadSignResponse;

      const drinkRequests: DrinkItemRequest[] = await Promise.all(
        stagedDrinks.map(async (drink) => {
          onProgress(drink.id, "uploading");
          try {
            const publicIds = await Promise.all(
              drink.files.map((f) => uploadToCloudinary(f, sig)),
            );
            onProgress(drink.id, "done");
            return {
              name: drink.name,
              category: "cocktail",
              imagePublicIds: publicIds,
            };
          } catch {
            onProgress(drink.id, "error");
            throw new Error(`Failed to upload images for "${drink.name}"`);
          }
        }),
      );

      const batchRes = await adminClientApi.POST(
        "/api/admin/places/{placeId}/drinks/batch",
        {
          params: { path: { placeId: placeId ?? "" } },
          body: { drinks: drinkRequests },
        },
      );
      if (!batchRes.response.ok)
        throw new Error(
          `${batchRes.response.status}: ${batchRes.response.statusText}`,
        );

      void mutate();
      toast.success(
        `${stagedDrinks.length} ${stagedDrinks.length === 1 ? "drink" : "drinks"} imported successfully`,
      );
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
      return false;
    }
  };

  return { drinks: elements, isLoading, updateDrink, importBatch };
}
