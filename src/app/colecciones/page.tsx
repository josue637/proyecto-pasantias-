import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Colecciones de tecnología y accesorios en Chile | Lúmina Tech",
  description:
    "Explora colecciones de audio, relojes inteligentes, accesorios móviles y hogar inteligente con despacho en Chile.",
  keywords: [
    "colecciones de tecnología Chile",
    "audio inalámbrico",
    "accesorios móviles",
    "hogar inteligente",
  ],
};

type CollectionsPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const { categoria } = await searchParams;
  const categories = [...new Set(products.map((product) => product.category))];
  const visibleProducts = categoria
    ? products.filter((product) => product.category === categoria)
    : products;
  const title =
    categoria && categories.includes(categoria)
      ? categoria
      : "Tecnología para cada momento";

  return (
    <main className="catalog-page">
      <header className="catalog-page-header">
        <Link className="brand" href="/" aria-label="Lúmina Tech, inicio">
          <span className="brand-mark" aria-hidden="true">LT</span>
          <span className="brand-name">LÚMINA TECH</span>
        </Link>
        <Link href="/#productos">Volver a la tienda</Link>
      </header>
      <section className="catalog-page-content" aria-labelledby="catalog-title">
        <p className="section-kicker">Colecciones Lúmina Tech</p>
        <h1 className="section-title" id="catalog-title">{title}</h1>
        <p className="catalog-demo-note">
          Catálogo de demostración: confirma precios, disponibilidad e
          información de productos antes de publicar.
        </p>
        <nav className="catalog-categories" aria-label="Filtrar por categoría">
          <Link href="/colecciones" aria-current={!categoria ? "page" : undefined}>
            Todos los productos
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/colecciones?categoria=${encodeURIComponent(category)}`}
              aria-current={categoria === category ? "page" : undefined}
            >
              {category}
            </Link>
          ))}
        </nav>
        <div className="catalog-product-grid">
          {visibleProducts.length ? (
            visibleProducts.map((product) => (
              <Link
                className="catalog-product-card"
                href={`/productos/${product.id}`}
                key={product.id}
              >
                <div className="catalog-product-image">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    loading="lazy"
                    quality={70}
                    sizes="(max-width: 640px) 48vw, (max-width: 900px) 48vw, 25vw"
                  />
                </div>
                <span className="product-category">{product.category}</span>
                <h2>{product.name}</h2>
                <span className="catalog-product-link">Ver producto →</span>
              </Link>
            ))
          ) : (
            <p>No encontramos productos en esta categoría.</p>
          )}
        </div>
      </section>
    </main>
  );
}
