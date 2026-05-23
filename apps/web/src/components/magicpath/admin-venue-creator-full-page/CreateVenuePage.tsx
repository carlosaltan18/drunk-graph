'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, ArrowRight, LogOut, Circle, AlertCircle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminAuthClient } from '@/lib/auth-client';
import { adminClientApi } from '@/lib/api/admin-client';

interface Props {
  userEmail: string;
}

const AdminSessionBar = ({ userEmail }: { userEmail: string }) => {
  const handleSignOut = () => {
    adminAuthClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/admin/login'; } } });
  };
  return <header className="sticky top-0 z-50 h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
    <div className="flex items-center gap-2">
      <Circle className="w-1.5 h-1.5 fill-amber-400 text-amber-400" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        Backoffice <span className="mx-1 text-zinc-600">·</span> {userEmail}
      </span>
    </div>
    <button onClick={handleSignOut} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer group">
      <span className="text-xs font-medium">Sign out</span>
      <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  </header>;
};

const VenuePreview = ({ name, location }: { name: string; location: string }) => {
  const displayName = name || 'Venue Name';
  const displayLocation = location || 'Location Address';
  return <div className="relative p-6 rounded-2xl border-2 border-dashed border-amber-400/20 bg-zinc-900/50 overflow-hidden">
    <div className="absolute top-3 right-3 bg-amber-400/10 text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-400/20">
      Preview Mode
    </div>
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
        <Building2 className="w-6 h-6 text-zinc-500" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white uppercase tracking-tight truncate">{displayName}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-sm text-zinc-500 font-medium truncate">{displayLocation}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Status: Ready</span>
        </div>
      </div>
    </div>
  </div>;
};

export const CreateVenuePage = ({ userEmail }: Props) => {
  const router = useRouter();
  const [formData, setFormData] = React.useState({ name: '', location: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const { error } = await adminClientApi.POST('/api/admin/places', {
      body: { name: formData.name, location: formData.location },
    });
    if (error) {
      setError('Failed to create venue');
      setIsSubmitting(false);
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  };

  return <div className="min-h-screen w-full bg-zinc-950 font-sans text-zinc-100 selection:bg-amber-400/30">
    <AdminSessionBar userEmail={userEmail} />

    <main className="max-w-7xl mx-auto px-8 py-16">
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4">
        <button onClick={() => router.push('/admin/dashboard')} className="text-zinc-500 hover:text-amber-400 transition-colors">
          Venues
        </button>
        <ChevronRight className="w-3 h-3 text-zinc-700" />
        <span className="text-zinc-300">New Venue</span>
      </nav>

      <header className="mb-16">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
          Create <br /> Venue
        </motion.h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <section className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Venue Details</span>
              <div className="h-[1px] flex-1 bg-zinc-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3 group">
                <label htmlFor="name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-focus-within:text-amber-400 transition-colors">
                  Venue Name
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Club Gallo Negro" required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-5 text-xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all" />
                <div className="flex items-center gap-1.5 px-1">
                  <AlertCircle className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-medium text-zinc-600 italic">* Required field for identification</span>
                </div>
              </div>

              <div className="space-y-3 group">
                <label htmlFor="location" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-focus-within:text-amber-400 transition-colors">
                  Location
                </label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Zona 10, Guatemala City" required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-5 text-xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all" />
                <div className="flex items-center gap-1.5 px-1">
                  <MapPin className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-medium text-zinc-600">City zone and municipality</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={isSubmitting} className={cn("flex-1 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-widest py-5 px-8 rounded-2xl text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 group", "disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed")}>
                  {isSubmitting ? 'Creating...' : 'Create Venue'}
                  {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
                <button type="button" onClick={() => router.push('/admin/dashboard')} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:border-amber-400/40 font-bold uppercase tracking-widest py-5 px-8 rounded-2xl transition-all active:scale-[0.98]">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        <aside className="lg:col-span-5 space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Quick Preview</h3>
                <VenuePreview name={formData.name} location={formData.location} />
                <p className="mt-4 text-[10px] font-medium text-zinc-600 italic px-1">This is how it will appear on your venue list.</p>
              </div>
              <div className="h-[1px] bg-zinc-800" />
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">What happens next?</h3>
                <div className="space-y-4">
                  {['Venue is added to your catalog', "You'll be redirected to the venue list", 'Add drinks to make them discoverable'].map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <span className="flex-none w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </main>

    <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="fixed -top-32 -right-32 w-96 h-96 bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />
  </div>;
};
