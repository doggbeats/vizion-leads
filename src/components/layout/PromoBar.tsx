"use client";

import { MessageCircle } from "lucide-react";

const whatsappNumber = "5561981494845";

export function PromoBar() {
  return (
    <div className="flex w-full items-center justify-center bg-black py-2">
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Atendimento personalizado via WhatsApp
      </a>
    </div>
  );
}
