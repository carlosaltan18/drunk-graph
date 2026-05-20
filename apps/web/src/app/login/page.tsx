"use client"

import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-950 p-12">
        <span className="text-white font-semibold tracking-tight">DrunkGraph</span>
        <blockquote className="text-zinc-400 text-sm leading-relaxed">
          "Recommendations that actually make sense — powered by the connections between things, not just what's popular."
        </blockquote>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
            <p className="text-sm text-zinc-500">Sign in to your account to continue</p>
          </div>

          <button
            onClick={() => authClient.signIn.oauth2({ providerId: "fusionauth" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50 active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-xs text-zinc-400">
            By signing in you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-zinc-600">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-zinc-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
}
