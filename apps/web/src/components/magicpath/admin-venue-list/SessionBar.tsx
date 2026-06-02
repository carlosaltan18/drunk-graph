"use client";
import { LogOut, MapPin, Radio, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";

interface SessionBarProps {
  type: "admin" | "client";
  userName?: string;
  venueName?: string;
}

export const SessionBar: React.FC<SessionBarProps> = ({
  type,
  userName = "JUAN PEREZ",
  venueName = "ZONA 10",
}) => {
  const router = useRouter();
  const isAdmin = type === "admin";
  const accentColor = isAdmin ? "text-amber-400" : "text-orange-500";
  const borderColor = isAdmin ? "border-amber-400/20" : "border-orange-500/20";
  const statusColor = isAdmin ? "bg-amber-400" : "bg-orange-500";

  const handleSignOut = () => {
    router.push("/api/auth-actions/sign-out?role=admin");
  };

  return (
    <div
      className={`w-full bg-zinc-950 border-b ${borderColor} h-14 flex items-center justify-between px-6 sticky top-0 z-50`}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span
            className={`font-black italic text-xl tracking-tighter ${accentColor}`}
          >
            DRUNKGRAPH<span className="text-white">.SYS</span>
          </span>
          <div className="hidden md:flex items-center gap-1.5 ml-4 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${statusColor}`}
            />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              System Active
            </span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 border-l border-zinc-800 pl-6">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${accentColor}`} />
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              {isAdmin ? "TERMINAL: ADMIN_01" : "ACCESS: CLIENT_NODE"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {venueName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-zinc-800">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-zinc-500 leading-none mb-0.5">
              IDENTIFIED AS
            </div>
            <div className="text-[12px] font-black text-white uppercase tracking-tight">
              {userName}
            </div>
          </div>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center bg-zinc-900 border ${borderColor}`}
          >
            {isAdmin ? (
              <Shield className={`w-4 h-4 ${accentColor}`} />
            ) : (
              <User className={`w-4 h-4 ${accentColor}`} />
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 hover:bg-zinc-900 p-2 rounded transition-colors group"
        >
          <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
          <span className="hidden md:inline text-[10px] font-black text-zinc-500 group-hover:text-red-500 uppercase tracking-widest transition-colors">
            Terminate
          </span>
        </button>
      </div>
    </div>
  );
};
