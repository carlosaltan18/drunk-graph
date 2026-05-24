"use client";
import { Clock, Home, LayoutGrid, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "feed", label: "Feed", icon: Home, href: "/dashboard" },
  {
    id: "browse",
    label: "Browse",
    icon: LayoutGrid,
    href: "/dashboard/browse",
  },
  { id: "history", label: "History", icon: Clock, href: "/dashboard/history" },
  { id: "profile", label: "Profile", icon: User, href: "/dashboard/profile" },
];

export const ClientBottomNav = () => {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-6 pb-8 pt-3 flex justify-between items-center z-50">
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="flex flex-col items-center gap-1 transition-colors"
          >
            <tab.icon
              size={20}
              className={cn(active ? "text-orange-500" : "text-zinc-600")}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                active ? "text-orange-500" : "text-zinc-600",
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
