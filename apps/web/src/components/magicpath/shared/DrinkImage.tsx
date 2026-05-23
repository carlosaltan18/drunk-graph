'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  /** Tailwind gradient classes used as fallback when no image */
  fallbackGradient?: string;
  sizes?: string;
  priority?: boolean;
}

export const DrinkImage = ({
  src,
  alt,
  fill,
  width,
  height,
  className,
  fallbackGradient = 'from-zinc-700 to-zinc-900',
  sizes,
  priority = false,
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <div className={cn('bg-gradient-to-br', fallbackGradient, className)} aria-hidden />;
  }

  return (
    <div className={cn('relative overflow-hidden', !fill && className)}>
      {/* Skeleton shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        priority={priority}
        className={cn(
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          fill ? className : 'w-full h-full',
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
};
