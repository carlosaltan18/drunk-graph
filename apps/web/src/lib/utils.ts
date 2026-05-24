import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function patchedFetch(input: Request): Promise<Response> {
  const response = await globalThis.fetch(input);
  if (response.status >= 500) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }
  return response;
}
