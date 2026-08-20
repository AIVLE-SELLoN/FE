"use client";

import { X } from "lucide-react";
import type { LegalSection } from "@/lib/legal/content";

export default function LegalModal({
  open,
  onClose,
  title,
  updatedAt,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="pt-0.5 text-[11px] text-slate-400">시행일자 {updatedAt}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {sections.map((section) => (
              <div key={section.heading}>
                <p className="text-[13px] font-bold text-slate-800">{section.heading}</p>
                <div className="mt-1.5 flex flex-col gap-1">
                  {section.body.map((line, i) => (
                    <p key={i} className="text-[13px] leading-relaxed text-slate-600">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
