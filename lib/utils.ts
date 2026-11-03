import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatOfficialPosition(position: string): string {
  switch (position) {
    case 'chairperson':
      return 'SK Chairperson';
    case 'secretary':
      return 'SK Secretary';
    case 'treasurer':
      return 'SK Treasurer';
    case 'kagawad':
      return 'SK Kagawad';
    default:
      return 'SK Official';
  }
}
