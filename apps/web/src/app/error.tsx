'use client';
import { ServerError500Screen } from '@/components/magicpath/500-server-error/ServerError500Screen';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return <ServerError500Screen variant="client" reset={reset} />;
}
