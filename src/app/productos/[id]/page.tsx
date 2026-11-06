import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatUsdPrice, products } from "@/data/products";
import { getConfiguredProductPrices } from "@/lib/product-pricing";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function findProduct(id: string) {
  return products.find((product) => product.id === id);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = findProduct(id);

  if (!product) {
    return {
      title: "Producto no encontrado | Lúmina Tech",
      description: "No encontramos el producto que buscas en Lúmina Tech.",
    };
  }

  const prices = getConfiguredProductPrices();
  const price = prices?.[product.id] ?? null;

  return {
    title: `${product.name}: tecnología en Venezuela | Lúmina Tech`,
    description: `${product.description} ${price === null ? "Precio en USD por confirmar." : `Precio: ${formatUsdPrice(price)}.`} Consulta disponibilidad en Lúmina Tech Venezuela.`,
    keywords: [
      product.name,
      product.category,
      `${product.name} Venezuela`,
      "tecnología en Venezuela",
    ],
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = findProduct(id);

  if (!product) notFound();

  const prices = getConfiguredProductPrices();
  const price = prices?.[product.id] ?? null;
  const structuredProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.image,
    sku: product.id,
    ...(price === null
      ? {}
      : {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }),
    ...(product.ratingVerified
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <>
      <header className="catalog-page-header">
        <Link className="brand" href="/" aria-label="Lúmina Tech, inicio">
          <span className="brand-mark" aria-hidden="true">LT</span>
          <span className="brand-name">LÚMINA TECH</span>
        </Link>
        <Link href="/colecciones">Ver colecciones</Link>
      </header>
      <main className="product-page">
        <nav className="product-breadcrumbs" aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/colecciones">Productos</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>
        <article className="product-page-layout">
          <div className="product-page-image">
            <Image
              src={product.image}
              alt={product.alt}
              fill
              priority
              quality={75}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
          <div className="product-page-details">
            <p className="section-kicker">{product.category}</p>
            <h1 className="section-title">{product.name}</h1>
            <p className="product-page-description">{product.description}</p>
            <p className="product-page-price">{formatUsdPrice(price)}</p>
            <p className="product-page-stock">
              {product.inStock ? "Disponible en stock" : "Agotado"}
            </p>
            <p className="catalog-demo-note">
              Ficha de demostración. Confirma el precio y disponibilidad antes
              de comprar.
            </p>
            {!product.ratingVerified && (
              <p className="catalog-demo-note">
                Las calificaciones visibles en el catálogo son de ejemplo y no
                se publican como reseñas verificadas en los datos estructurados.
              </p>
            )}
            <Link className="button-primary" href="/contacto">
              Consultar sobre este producto
            </Link>
          </div>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredProduct).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
