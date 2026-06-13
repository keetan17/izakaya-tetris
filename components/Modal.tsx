"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="wood-panel w-full max-w-md rounded-lg border border-amber-600 p-4 shadow-board">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-amber-50">{title}</h2>
          <button onClick={onClose} aria-label="閉じる" className="grid h-11 w-11 place-items-center rounded-md bg-black/45">
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
