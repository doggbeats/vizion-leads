import { Truck, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Entregas",
    description: "Fazemos entregas rápidas e seguras para todo o Brasil",
  },
  {
    icon: CreditCard,
    title: "Pagamentos",
    description: "Cartão de crédito em até 4x, boleto ou Link de pagamento",
  },
  {
    icon: Headphones,
    title: "Atendimento",
    description: "Suporte personalizado via WhatsApp e e-mail",
  },
];

export function InfoCards() {
  return (
    <section className="bg-ink py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:gap-6 sm:px-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center gap-3 rounded-2xl border border-graphite-border bg-graphite p-6 text-center transition-all duration-300 hover:border-brand/30 hover:bg-graphite-light sm:p-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              <feature.icon className="h-7 w-7 text-brand" />
            </div>
            <h3 className="font-display text-lg tracking-wide text-white sm:text-xl">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
