import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast as sonnerToast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toast = (title: string, description?: string) => {
  sonnerToast(title, {
    description,
    action: {
      label: "Dismiss",
      onClick: () => undefined,
    },
  });
};
