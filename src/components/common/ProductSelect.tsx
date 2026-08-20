"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type ProductOption = { id: string; name: string };

const DEFAULT_PRODUCTS: ProductOption[] = [
  { id: "P001", name: "미디 원피스" },
  { id: "P002", name: "린넨 셔츠" },
  { id: "P003", name: "슬림 슬랙스" },
  { id: "P004", name: "오버핏 가디건" },
];

export default function ProductSelect({
  products = DEFAULT_PRODUCTS,
  value,
  onChange,
}: {
  products?: ProductOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = products.find((p) => p.id === value) ?? products[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-lg font-bold text-slate-900 hover:text-indigo-600"
      >
        {selected.name} ({selected.id})
        <ChevronDown className={"h-3.5 w-3.5 text-slate-400 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute left-0 top-[34px] z-20 w-[240px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.14)]">
          {products.map((p) => {
            const isSelected = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm " +
                  (isSelected ? "bg-[#F5F3FF] font-bold text-[#4F39F6]" : "font-medium text-slate-600 hover:bg-slate-50")
                }
              >
                {p.name} ({p.id})
                {isSelected && <Check className="h-3.5 w-3.5 text-[#4F39F6]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
