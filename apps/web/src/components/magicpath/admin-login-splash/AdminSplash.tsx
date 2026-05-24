"use client";
import { motion } from "framer-motion";
import { AlertCircle, Lock, LogIn, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { adminAuthClient } from "@/lib/auth-client";

const BackgroundDecoration = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-20">
      <h1 className="text-[25rem] font-black tracking-tighter text-zinc-900 leading-none select-none">
        ADMIN
      </h1>
    </div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-950/10 rounded-full blur-[120px]" />
  </div>
);

const BrandingLockup = () => (
  <div className="relative z-10 flex flex-col items-center mb-12">
    <span className="text-[0.7rem] font-bold text-amber-400 tracking-[0.4em] uppercase mb-2">
      BACKOFFICE
    </span>
    <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-1">
      DRUNKGRAPH
    </h1>
    <div className="w-full h-[2px] bg-amber-400" />
    <span className="mt-3 text-lg text-zinc-500 italic font-medium">
      Admin Console
    </span>
  </div>
);

export const AdminSplash: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSignedOut = searchParams.get("signout") === "true";

  useEffect(() => {
    if (isSignedOut) return;
    adminAuthClient.signIn.oauth2({
      providerId: "fusionauth-admin",
      callbackURL: "/admin/dashboard",
    });
  }, [isSignedOut]);

  const handleSignIn = () => {
    adminAuthClient.signIn.oauth2({
      providerId: "fusionauth-admin",
      callbackURL: "/admin/dashboard",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] font-sans text-zinc-200 flex items-center justify-center p-8">
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl px-6 py-20 bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/50 rounded-3xl overflow-hidden shadow-2xl">
        <BackgroundDecoration />
        <BrandingLockup />

        <div className="relative z-10 flex flex-col items-center mt-4 w-full max-w-[320px]">
          {isSignedOut ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 mb-8 text-zinc-400">
                <AlertCircle size={16} className="text-amber-400/80" />
                <span className="text-lg font-light tracking-wide">
                  You have been signed out.
                </span>
              </div>
              <button
                onClick={handleSignIn}
                className="group flex items-center justify-center gap-3 bg-amber-400 text-zinc-950 px-16 py-5 rounded-xl font-black text-xl uppercase tracking-wider hover:bg-amber-300 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(251,191,36,0.15)]"
              >
                <LogIn size={24} strokeWidth={2.5} />
                <span>SIGN IN</span>
              </button>
              <p className="mt-8 text-zinc-600 text-[0.65rem] uppercase tracking-[0.3em] font-medium flex items-center gap-2">
                <Lock size={10} className="text-zinc-700" />
                Staff access only.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden relative mb-4">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "30%", "60%", "100%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ShieldCheck size={12} className="text-amber-400/60" />
                </motion.div>
                <span className="text-[0.65rem] uppercase tracking-widest font-medium">
                  Verifying credentials...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
