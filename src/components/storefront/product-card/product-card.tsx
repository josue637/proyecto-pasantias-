"use client";

import Image from "next/image";
import { useState } from "react";
import { HeartIcon, PlusIcon } from "@/components/storefront/icons";
import { formatPrice, type Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
  onAdd: () => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  function addToCart() {
    onAdd();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="product-card">
      <div className="product-visual">
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 900px) 48vw, 25vw"
          />
        </div>
        {product.label && <span className="product-label">{product.label}</span>}
        <button
          className={`favorite-button${favorite ? " is-favorite" : ""}`}
          type="button"
          aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          aria-pressed={favorite}
          onClick={() => setFavorite((current) => !current)}
        >
          <HeartIcon width={17} height={17} />
        </button>
        <button
          className={`add-to-cart${added ? " is-added" : ""}`}
          type="button"
          onClick={addToCart}
        >
          {added ? "Agregado a tu bolsa" : "Agregar a la bolsa"}
          {added ? <span aria-hidden="true">✓</span> : <PlusIcon width={15} height={15} />}
        </button>
      </div>
      <div className="product-details">
        <p className="product-category">{product.category}</p>
        <div className="product-name-row">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <div className="product-rating" aria-label={`Calificación ${product.rating} de 5, ${product.reviews} reseñas`}>
          <span className="stars" aria-hidden="true">★★★★★</span>
          <span>{product.rating} ({product.reviews})</span>
        </div>
      </div>
    </article>
  );
}
