import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateUrlParams(params: Record<string, string>) {
  const searchParams = new URLSearchParams(window.location.search)
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value)
  })
  
  window.history.replaceState({}, '', `?${searchParams.toString()}`)
  
  return searchParams
}
