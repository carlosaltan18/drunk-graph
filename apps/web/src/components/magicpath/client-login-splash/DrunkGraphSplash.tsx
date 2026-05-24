"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const DrunkGraphSplash: React.FC = () => {
  const searchParams = useSearchParams();
  const isSignedOut = searchParams.get("signout") === "true";
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (isSignedOut) return;
    setTriggered(true);
    authClient.signIn.oauth2({
      providerId: "fusionauth",
      callbackURL: "/dashboard",
    });
  }, [isSignedOut]);

  const handleSignIn = () => {
    authClient.signIn.oauth2({
      providerId: "fusionauth",
      callbackURL: "/dashboard",
    });
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />

      <div className="absolute -top-20 -left-20 pointer-events-none select-none">
        <span className="text-[40rem] font-black text-zinc-900/40 leading-none rotate-[-12deg] inline-block blur-[2px]">
          D
        </span>
      </div>
      <div className="absolute -bottom-40 -right-20 pointer-events-none select-none">
        <span className="text-[40rem] font-black text-zinc-900/30 leading-none rotate-[8deg] inline-block blur-[4px]">
          G
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-8 w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-2 mb-12"
        >
          <h1
            className={cn(
              "text-5xl md:text-6xl font-black tracking-tighter leading-none text-white uppercase",
              "transform -rotate-1 select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]",
            )}
          >
            DRUNK
            <br />
            GRAPH
          </h1>
          <p className="text-zinc-500 italic font-medium text-lg tracking-wide">
            Find your drink.
          </p>
        </motion.div>

        <div className="w-full min-h-[180px] flex flex-col items-center justify-start">
          <AnimatePresence mode="wait">
            {isSignedOut ? (
              <motion.div
                key="signed-out"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col items-center space-y-8"
              >
                <p className="text-zinc-400 font-medium">
                  You&apos;ve been signed out.
                </p>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className={cn(
                    "w-full py-5 bg-[#f97316] text-black font-black uppercase text-xl rounded-xl",
                    "active:scale-95 transition-transform duration-100 shadow-[0_0_30px_rgba(249,115,22,0.3)]",
                    "hover:bg-[#fb923c] cursor-pointer",
                  )}
                >
                  SIGN IN
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="flex items-center space-x-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        delay,
                        ease: "easeInOut",
                      }}
                      className="w-3 h-3 bg-[#f97316] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                    />
                  ))}
                </div>
                <p className="text-zinc-600 font-medium text-xs uppercase tracking-[0.2em] animate-pulse">
                  Redirecting to login...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!isSignedOut && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#f97316] origin-left shadow-[0_-4px_12px_rgba(249,115,22,0.4)]"
        />
      )}
    </main>
  );
};
