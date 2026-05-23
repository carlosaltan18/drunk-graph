'use client';
import { SWRConfig } from 'swr';
import { toast } from 'sonner';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ onError: (err) => toast.error(err instanceof Error ? err.message : 'Something went wrong') }}>
      {children}
    </SWRConfig>
  );
}
