"use client";

import { useRouter } from "next/navigation";
import { signOutAdmin, signOutUser } from "@/lib/actions/auth";

type Props = {
  email: string;
  userRole: "user" | "admin";
  otherSession: { email: string; userRole: "user" | "admin" } | null;
};

export default function SessionBar({ email, userRole, otherSession }: Props) {
  const router = useRouter();

  async function signOut() {
    if (userRole === "admin") await signOutAdmin();
    else await signOutUser();
  }

  function switchSession() {
    router.push(
      otherSession?.userRole === "admin" ? "/admin/dashboard" : "/dashboard",
    );
    router.refresh();
  }

  const isAdmin = userRole === "admin";

  return (
    <div
      className={`w-full px-4 py-2 flex items-center gap-3 text-sm border-b ${
        isAdmin
          ? "bg-primary text-primary-foreground border-primary/30"
          : "bg-card text-foreground border-border"
      }`}
    >
      {isAdmin && (
        <span className="font-bold tracking-widest text-xs opacity-80">
          ⚠ BACKOFFICE
        </span>
      )}
      <span className="font-medium truncate">{email}</span>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {otherSession && (
          <button
            type="button"
            onClick={switchSession}
            className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
              isAdmin
                ? "bg-black/10 hover:bg-black/20"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            }`}
          >
            {otherSession.userRole === "admin"
              ? "Switch to backoffice ↗"
              : "Switch to user app ↗"}
          </button>
        )}
        <button
          type="button"
          onClick={signOut}
          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
            isAdmin
              ? "bg-black/10 hover:bg-black/20"
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          }`}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
