import { NovidadesCarousel } from "@/components/home/NovidadesCarousel";
import { Categories } from "@/components/home/Categories";
import { InfoCards } from "@/components/home/InfoCards";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FloatingPromo } from "@/components/home/FloatingPromo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <NovidadesCarousel />
      <Categories />
      <InfoCards />
      <FeaturedProducts />
      <FloatingPromo />
    </>
  );
}