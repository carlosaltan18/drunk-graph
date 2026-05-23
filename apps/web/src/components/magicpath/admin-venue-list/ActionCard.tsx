import React from 'react';
import Image from 'next/image';
interface ActionCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  accentText?: string;
  price?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'admin' | 'client';
}
export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  image,
  badge,
  accentText,
  price,
  onClick,
  children,
  variant = 'client'
}) => {
  const accentColor = variant === 'admin' ? 'text-amber-400' : 'text-orange-500';
  const badgeBg = variant === 'admin' ? 'bg-amber-400' : 'bg-orange-500';
  return <div onClick={onClick} className={`group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col h-full ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}>
      {/* Badge Overlay */}
      {badge && <div className={`absolute top-3 left-3 z-10 ${badgeBg} text-black text-[10px] font-black px-2 py-0.5 rounded tracking-tighter uppercase`}>
          {badge}
        </div>}

      {/* Image Container */}
      {image && <div className="relative aspect-video w-full overflow-hidden">
          <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </div>}

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tight group-hover:text-amber-50 group-hover:translate-x-1 transition-all">
            {title}
          </h3>
          {price && <span className={`text-sm font-black whitespace-nowrap ${accentColor}`}>
              {price}
            </span>}
        </div>

        {subtitle && <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">
            {subtitle}
          </p>}

        {accentText && <div className={`text-[11px] font-black italic uppercase tracking-tighter mb-4 flex items-center gap-1.5 ${accentColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {accentText}
          </div>}

        <div className="mt-auto">
          {children}
        </div>
      </div>

      {/* Rough Decorative Edge (Bottom) */}
      <div className="h-1 bg-zinc-950 w-full" />
    </div>;
};