"use client";

import { ArrowRightIcon } from "@/components/storefront/icons";
import { products } from "@/data/products";
import { ProductCard } from "@/components/storefront/product-card/product-card";
import { useMemo, useState } from "react";

type FeaturedProductsProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
};

type PriceFilter = "all" | "under-30000" | "30000-60000" | "over-60000";
type SortOrder = "featured" | "price-asc" | "price-desc" | "rating";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function matchesPrice(price: number, filter: PriceFilter) {
  switch (filter) {
    case "under-30000":
      return price < 30000;
    case "30000-60000":
      return price >= 30000 && price <= 60000;
    case "over-60000":
      return price > 60000;
    default:
      return true;
  }
}

export function FeaturedProducts({
  query,
  onQueryChange,
  onAdd,
}: FeaturedProductsProps) {
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [],
  );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const result = products.filter((product) => {
      const searchableText = normalizeText(
        `${product.name} ${product.category} ${product.label ?? ""} ${product.alt}`,
      );
      return (
        searchableText.includes(normalizedQuery) &&
        (category === "all" || product.category === category) &&
        matchesPrice(product.price, priceFilter)
      );
    });

    return result.sort((first, second) => {
      if (sortOrder === "price-asc") return first.price - second.price;
      if (sortOrder === "price-desc") return second.price - first.price;
      if (sortOrder === "rating") {
        return Number(second.rating) - Number(first.rating);
      }
      return products.indexOf(first) - products.indexOf(second);
    });
  }, [category, priceFilter, query, sortOrder]);

  function clearFilters() {
    onQueryChange("");
    setCategory("all");
    setPriceFilter("all");
    setSortOrder("featured");
  }

  return (
    <section className="products-section" id="productos">
      <div className="section-wrap">
        <div className="section-heading products-heading">
          <div>
            <p className="section-kicker">Selección destacada</p>
            <h2 className="section-title">Tecnología que te sigue el ritmo.</h2>
            <p className="products-intro">
              Accesorios funcionales y dispositivos inteligentes para todos los días.
            </p>
          </div>
          <a className="text-link" href="#colecciones">
            Explorar todo <ArrowRightIcon width={16} height={16} />
          </a>
        </div>
        <div className="product-filters" aria-label="Filtros de productos">
          <label className="product-search-field">
            <span>Buscar productos</span>
            <input
              type="search"
              placeholder="Producto o categoría"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <label className="product-filter-field">
            <span>Categoría</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Todas</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="product-filter-field">
            <span>Precio</span>
            <select
              value={priceFilter}
              onChange={(event) =>
                setPriceFilter(event.target.value as PriceFilter)
              }
            >
              <option value="all">Cualquier precio</option>
              <option value="under-30000">Menos de $30.000</option>
              <option value="30000-60000">$30.000 – $60.000</option>
              <option value="over-60000">Más de $60.000</option>
            </select>
          </label>
          <label className="product-filter-field">
            <span>Ordenar por</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="featured">Recomendados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </label>
          <div className="filter-results">
            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
            {(query || category !== "all" || priceFilter !== "all" || sortOrder !== "featured") && (
              <button type="button" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))
          ) : (
            <p className="no-results">
              No encontramos productos para “{query}”. Prueba con otra búsqueda.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
