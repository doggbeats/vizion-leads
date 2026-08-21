"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, className = "", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Janela"}
    >
      <div
        className={`animate-fade-up relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-graphite-border bg-graphite p-5 shadow-2xl ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h3 className="font-display text-2xl tracking-wide text-white">{title}</h3> : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-graphite-border bg-graphite-light text-white transition-colors hover:border-brand hover:bg-brand hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
