"use client";
import type { components } from "@generated/api/schema.d.ts";
import { ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { ClientBottomNav } from "@/components/magicpath/shared/ClientBottomNav";
import { authClient } from "@/lib/auth-client";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { useStats } from "@/lib/hooks/useStats";
import { useTastes } from "@/lib/hooks/useTastes";
import { cn } from "@/lib/utils";

type ApiUser = components["schemas"]["User"];
type UserStats = components["schemas"]["UserStats"];

interface Props {
  fallbackUser: ApiUser;
  fallbackTastes: Record<string, number>;
  fallbackStats: UserStats;
}

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-zinc-900 rounded-xl p-5 border border-zinc-800/50",
      className,
    )}
  >
    {children}
  </div>
);

const FlavorRow = ({ name, score }: { name: string; score: number }) => (
  <div className="flex items-center justify-between py-2 group">
    <span className="text-zinc-300 text-sm capitalize font-medium group-hover:text-zinc-100 transition-colors">
      {name}
    </span>
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-orange-500 rounded-full"
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className="text-zinc-500 text-[10px] font-mono tabular-nums">
        {score.toFixed(1)}
      </span>
    </div>
  </div>
);

export const ProfileScreen = ({
  fallbackUser,
  fallbackTastes,
  fallbackStats,
}: Props) => {
  const router = useRouter();
  const { preferences: user } = usePreferences(fallbackUser);
  const { tastes } = useTastes(fallbackTastes);
  const { stats } = useStats(fallbackStats);

  const sortedTastes = Object.entries(tastes).sort(([, a], [, b]) => b - a);
  const initial = (user?.alias ?? user?.id ?? "?")[0].toUpperCase();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login?signout=true") },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
      <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 space-y-8">
        {/* Identity */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-[72px] h-[72px] bg-zinc-800 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <span className="text-2xl font-black text-white">{initial}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-orange-500 w-5 h-5 rounded-full border-2 border-zinc-950 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {user?.alias ?? "Anonymous"}
            </h1>
            {user?.age && (
              <p className="text-zinc-500 text-sm font-medium">
                age {user.age}
              </p>
            )}
          </div>
        </section>

        {/* Stats strip */}
        <Card className="grid grid-cols-3 p-0 overflow-hidden shadow-xl shadow-black/20">
          {[
            { value: String(stats?.tried ?? "—"), label: "TRIED" },
            { value: String(stats?.venues ?? "—"), label: "VENUES" },
            {
              value: (stats?.favCategory ?? "—").slice(0, 6).toUpperCase(),
              label: "FAV TYPE",
            },
          ].map((stat, idx, arr) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-1 text-center",
                idx < arr.length - 1 && "border-r border-zinc-800",
              )}
            >
              <span className="text-orange-500 text-xl font-black tracking-tight leading-none mb-1">
                {stat.value}
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </Card>

        {/* Flavor profile */}
        <section className="space-y-2">
          <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">
            Your Flavor Profile
          </h3>
          <Card className="space-y-1">
            {sortedTastes.length > 0 ? (
              <>
                <div className="divide-y divide-zinc-800/30">
                  {sortedTastes.map(([name, score]) => (
                    <FlavorRow key={name} name={name} score={score} />
                  ))}
                </div>
                <button
                  onClick={() =>
                    router.push("/dashboard/onboarding?back=/dashboard/profile")
                  }
                  className="flex items-center gap-1.5 pt-4 text-orange-500 text-[11px] font-bold uppercase tracking-wider group"
                >
                  Edit preferences
                  <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center text-center space-y-3">
                <p className="text-zinc-500 text-xs max-w-[200px] leading-relaxed">
                  No preferences set. Your feed won't be personalized.
                </p>
                <button
                  onClick={() =>
                    router.push("/dashboard/onboarding?back=/dashboard/profile")
                  }
                  className="text-orange-500 text-xs font-bold uppercase tracking-wider border-b border-orange-500/30 pb-0.5"
                >
                  Set up tastes →
                </button>
              </div>
            )}
          </Card>
        </section>

        {/* Account details */}
        <section className="space-y-2">
          <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">
            Account
          </h3>
          <Card className="p-0 px-5">
            {[
              {
                label: "Max per drink",
                value: user?.budgetMax != null ? `Q ${user.budgetMax}` : "—",
              },
              {
                label: "Preference",
                value:
                  user?.prefersAlcohol === false ? (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-md border border-green-500/20">
                      Non-alcoholic
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase rounded-md border border-orange-500/20">
                      Alcoholic
                    </span>
                  ),
              },
            ].map((row, idx, arr) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-center justify-between py-4",
                  idx < arr.length - 1 && "border-b border-zinc-800",
                )}
              >
                <span className="text-zinc-500 text-sm">{row.label}</span>
                <span className="text-zinc-300 text-sm font-medium">
                  {row.value}
                </span>
              </div>
            ))}
          </Card>
        </section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl py-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">
            Sign Out
          </span>
        </button>
      </main>
      <ClientBottomNav />
    </div>
  );
};
