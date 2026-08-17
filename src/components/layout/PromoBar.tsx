"use client";

import { Percent, Truck, MessageCircle } from "lucide-react";

const whatsappNumber = "5561981494845";

export function PromoBar() {
  return (
    <div className="w-full overflow-hidden bg-white py-1.5">
      <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="mx-8 flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-black">
            <span className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" />
              5 % OFF no PIX
            </span>
            <span className="text-black/30">•</span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Frete grátis acima de R$ 200
            </span>
            <span className="text-black/30">•</span>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Atendimento personalizado via WhatsApp
            </a>
            <span className="text-black/30">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
