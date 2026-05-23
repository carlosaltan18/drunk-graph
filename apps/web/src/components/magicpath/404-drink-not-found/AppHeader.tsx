import React from 'react';
import { ChevronLeft } from 'lucide-react';
interface AppHeaderProps {
  onBack?: () => void;
  showLogo?: boolean;
  title?: string;
}
export const AppHeader: React.FC<AppHeaderProps> = ({
  onBack,
  showLogo = true,
  title
}) => {
  return <header className="sticky top-0 z-50 w-full bg-[#09090b] border-b border-[#27272a] px-5 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && <button onClick={onBack} className="flex items-center justify-center w-8 h-8 -ml-1 hover:bg-zinc-800 rounded transition-colors" aria-label="Go back">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>}

        {showLogo && <div className="flex items-center gap-2">
            <div className="w-7 h-7 brand-gradient-orange flex items-center justify-center rounded">
              <span className="text-white font-black text-sm tracking-tighter">DG</span>
            </div>
            <span className="font-black text-base tracking-tighter uppercase text-white leading-none" style={{
          fontFamily: '"Geist Sans", "Inter", system-ui, sans-serif'
        }}>
              DRUNK<span className="text-[#f97316]">GRAPH</span>
            </span>
          </div>}

        {title && <h1 className="text-sm font-black text-zinc-300 uppercase tracking-widest ml-1">
            {title}
          </h1>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
    </header>;
};