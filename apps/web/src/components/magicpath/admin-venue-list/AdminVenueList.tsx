"use client";
import type { components } from "@generated/admin-api/schema.d.ts";
import { ArrowRight, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useAdminPlaces } from "@/lib/hooks/useAdminPlaces";
import { ActionCard } from "./ActionCard";
import { BrandButton } from "./BrandButton";
import { SessionBar } from "./SessionBar";

type PagedResultPlace = components["schemas"]["PagedResultPlace"];

interface Props {
  fallbackData?: PagedResultPlace;
  userEmail: string;
}

export const AdminVenueList: React.FC<Props> = ({
  fallbackData,
  userEmail,
}) => {
  const { places: placeList } = useAdminPlaces(fallbackData);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-400 selection:text-black">
      <SessionBar
        type="admin"
        userName={userEmail.toUpperCase()}
        venueName="ROOT ACCESS"
      />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-800 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Venues
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              Manage your drink catalog and venues
            </p>
          </div>

          <Link
            href="/admin/places/new"
            className="flex items-center gap-2 px-6 py-3 border-2 border-zinc-700 rounded-xl hover:border-amber-400 hover:text-amber-400 transition-all group self-start md:self-end"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-black uppercase tracking-tighter">
              Add Venue
            </span>
          </Link>
        </header>

        {!placeList.length ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">
              No venues yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {placeList.map((place) => (
              <div key={place.id} className="relative">
                <ActionCard
                  title={place.name ?? ""}
                  subtitle={place.location}
                  variant="admin"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {place.location}
                      </span>
                    </div>
                    <Link href={`/admin/places/${place.id}`}>
                      <BrandButton
                        variant="admin"
                        size="md"
                        className="w-full justify-between"
                      >
                        <span>Manage Drinks</span>
                        <ArrowRight className="w-5 h-5" />
                      </BrandButton>
                    </Link>
                  </div>
                </ActionCard>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-24 pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
            Drunkgraph © 2025 · Backoffice
          </div>
        </footer>
      </main>
    </div>
  );
};
