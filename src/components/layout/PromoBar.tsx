"use client";

import { useState, useEffect } from "react";
import { Percent, Truck, MessageCircle } from "lucide-react";

const whatsappNumber = "5561981494845";

const items = [
  {
    icon: Percent,
    text: "5 OFF no PIX",
  },
  {
    icon: Truck,
    text: "Frete grátis acima de R$ 200",
  },
  {
    icon: MessageCircle,
    text: "Atendimento personalizado via WhatsApp",
    href: `https://wa.me/${whatsappNumber}`,
  },
];

export function PromoBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full items-center justify-center bg-black py-2">
      <div className="relative h-5 w-full max-w-lg overflow-hidden">
        {items.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Icon className="h-3.5 w-3.5" />
              {item.text}
            </span>
          );

          return (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                index === current
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
