import { clsx, type ClassValue } from "clsx";

export function rainCn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
