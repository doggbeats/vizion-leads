import Image from "next/image";

export function NovidadesCarousel() {
  return (
    <section className="relative w-full bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative aspect-[3/1] w-full">
            <Image
              src="/images/page_principal.jpg"
              alt="Vizion Store"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
