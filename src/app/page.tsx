import { NovidadesCarousel } from "@/components/home/NovidadesCarousel";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <NovidadesCarousel />
      <Categories />
      <FeaturedProducts />
    </>
  );
}