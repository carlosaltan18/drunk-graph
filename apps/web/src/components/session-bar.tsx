"use client"

import { useRouter } from "next/navigation"
import { signOutUser, signOutAdmin } from "@/lib/actions/auth"

type Props = {
  email: string
  role: "user" | "admin"
  otherSession: { email: string; role: "user" | "admin" } | null
}

export default function SessionBar({ email, role, otherSession }: Props) {
  const router = useRouter()

  async function signOut() {
    if (role === "admin") await signOutAdmin()
    else await signOutUser()
  }

  function switchSession() {
    router.push(otherSession?.role === "admin" ? "/admin/dashboard" : "/dashboard")
    router.refresh()
  }

  const isAdmin = role === "admin"

  return (
    <div className={`w-full px-4 py-2 flex items-center gap-3 text-sm border-b ${
      isAdmin
        ? "bg-primary text-primary-foreground border-primary/30"
        : "bg-card text-foreground border-border"
    }`}>
      {isAdmin && (
        <span className="font-bold tracking-widest text-xs opacity-80">⚠ BACKOFFICE</span>
      )}
      <span className="font-medium truncate">{email}</span>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {otherSession && (
          <button
            onClick={switchSession}
            className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
              isAdmin
                ? "bg-black/10 hover:bg-black/20"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            }`}
          >
            {otherSession.role === "admin" ? "Switch to backoffice ↗" : "Switch to user app ↗"}
          </button>
        )}
        <button
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
  )
}
