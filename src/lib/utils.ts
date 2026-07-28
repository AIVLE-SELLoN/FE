import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn 표준 cn 헬퍼 (조건부 tailwind 클래스 합치기)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
