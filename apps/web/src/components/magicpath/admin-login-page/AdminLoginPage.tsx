import * as React from "react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, BarChart3, Wine, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AdminLoginPage - A secure, restricted backoffice access point for DrunkGraph.
 * 
 * Design Details:
 * - Asymmetric layout (45/55 split)
 * - Color Palette: Zinc-950 background, Zinc-900 surfaces, Amber-400 accent.
 * - Typography: Bold uppercase headers, high contrast hierarchy.
 * - Interaction: Animated form focus and error state transitions.
 */

const STAT_ITEMS = [{
  label: "4 venues",
  icon: BarChart3
}, {
  label: "24 drinks",
  icon: Wine
}, {
  label: "Guatemala City",
  icon: MapPin
}];
export const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isError, setIsError] = React.useState(true); // Default to true to show the requested error state example
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsError(true);
    }, 1500);
  };
  return <main className="flex h-screen w-full bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-amber-400/30 selection:text-amber-400">
      
      {/* LEFT PANEL - Brand & Context (~45%) */}
      <section className="relative hidden lg:flex flex-col justify-between w-[45%] h-full p-12 bg-[#09090b]">
        
        {/* LOGO AREA */}
        <div className="z-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              DRUNKGRAPH
            </h1>
            <div className="inline-flex">
              <span className="bg-amber-400 text-[#09090b] text-[10px] font-black tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase">
                BACKOFFICE
              </span>
            </div>
          </div>
        </div>

        {/* CENTER CONTENT - Editorial Lockup */}
        <div className="relative z-10">
          {/* Background Text Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 pointer-events-none select-none">
            <span className="text-[12rem] font-black text-zinc-900 opacity-30 leading-none whitespace-nowrap -ml-20">
              STAFF ONLY
            </span>
          </div>
          
          <div className="relative max-w-sm">
            <h2 className="text-4xl font-bold text-white mb-4 leading-[1.1]">
              Venue management console.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              Manage your bar catalog, upload drinks, track performance and monitor venue activity in real-time.
            </p>
          </div>
        </div>

        {/* BOTTOM CONTENT - Stats Pills */}
        <div className="z-10 flex flex-wrap gap-3">
          {STAT_ITEMS.map((item, idx) => <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <item.icon size={14} className="text-amber-400" />
              <span>{item.label}</span>
            </div>)}
        </div>

        {/* Right Edge Divider Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-amber-400" />
      </section>

      {/* RIGHT PANEL - Login Form (~55%) */}
      <section className="flex-1 flex flex-col justify-center items-center bg-[#18181b] p-6 lg:p-12">
        <div className="w-full max-w-[380px] space-y-8">
          
          {/* HEADER */}
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-400" size={32} />
              <h3 className="text-4xl font-black text-white tracking-tight uppercase">
                STAFF LOGIN
              </h3>
            </div>
            <p className="text-zinc-500 font-medium">
              Authorized personnel only. Restricted access.
            </p>
          </header>

          {/* FORM CARD */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-[#09090b] border border-zinc-800 rounded-xl p-8 shadow-2xl shadow-black/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* EMAIL FIELD */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                  EMAIL ADDRESS
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={cn("block w-full pl-11 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl", "text-white placeholder:text-zinc-600 outline-none transition-all", "focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400")} placeholder="admin@yourbar.com" required />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                  PASSWORD
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={cn("block w-full pl-11 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl", "text-white placeholder:text-zinc-600 outline-none transition-all", "focus:ring-2 focus:ring-amber-400/50 focus:border-zinc-700")} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className={cn("w-full flex items-center justify-center gap-2 py-4 bg-amber-400 text-black text-lg font-black uppercase rounded-xl", "hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed")}>
                  {isSubmitting ? <motion.div animate={{
                  rotate: 360
                }} transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }} className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full" /> : <>
                      ACCESS BACKOFFICE
                      <ArrowRight size={20} strokeWidth={3} />
                    </>}
                </button>
              </div>

              {/* ERROR STATE */}
              <AnimatePresence>
                {isError && <motion.div initial={{
                opacity: 0,
                height: 0
              }} animate={{
                opacity: 1,
                height: "auto"
              }} exit={{
                opacity: 0,
                height: 0
              }} className="overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                        Invalid credentials. Try again.
                      </span>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* FOOTER LINKS */}
          <footer className="space-y-4 text-center">
            <p className="text-zinc-600 text-[10px] leading-tight max-w-[280px] mx-auto">
              Forgot your password? Contact your system administrator for manual credential recovery.
            </p>
            <div className="pt-4 border-t border-zinc-800/50">
              <a href="#" className="text-zinc-700 hover:text-amber-400 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                Not staff? Go to drunkgraph.com
                <ArrowRight size={12} />
              </a>
            </div>
          </footer>
        </div>
      </section>

      {/* Mobile background decorative element */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-1 bg-amber-400 z-50" />
    </main>;
};