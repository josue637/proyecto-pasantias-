import { ArrowRightIcon } from "@/components/storefront/icons";
import { products } from "@/data/products";
import { ProductCard } from "@/components/storefront/product-card/product-card";

type FeaturedProductsProps = {
  query: string;
  onAdd: () => void;
};

export function FeaturedProducts({ query, onAdd }: FeaturedProductsProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`.toLocaleLowerCase("es").includes(normalizedQuery),
  );

  return (
    <section className="products-section" id="productos">
      <div className="section-wrap">
        <div className="section-heading products-heading">
          <div>
            <p className="section-kicker">Elegidos para ti</p>
            <h2 className="section-title">Piezas que hacen hogar.</h2>
            <p className="products-intro">
              Diseñadas con intención, hechas para acompañarte por mucho tiempo.
            </p>
          </div>
          <a className="text-link" href="#colecciones">
            Explorar todo <ArrowRightIcon width={16} height={16} />
          </a>
        </div>
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))
          ) : (
            <p className="no-results">
              No encontramos piezas para “{query}”. Prueba con otra búsqueda.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
