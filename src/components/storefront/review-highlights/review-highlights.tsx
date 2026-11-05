import { products } from "@/data/products";

export function ReviewHighlights() {
  return (
    <section
      className="reviews-section"
      id="calificaciones"
      aria-labelledby="reviews-title"
    >
      <div className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Opiniones y calificaciones</p>
            <h2 className="section-title" id="reviews-title">
              Opiniones y calificaciones de productos.
            </h2>
          </div>
          <p className="reviews-note">
            Calificaciones y reseñas de ejemplo: reemplázalas por opiniones
            reales antes de publicar.
          </p>
        </div>
        <div className="review-grid">
          {products.map((product) => (
            <article className="review-card" key={product.id}>
              <span
                className="review-stars"
                role="img"
                aria-label={`${product.rating} de 5 estrellas`}
              >
                ★★★★★
              </span>
              <strong>{product.rating}<span>/5</span></strong>
              <p>{product.name}</p>
              <span className="review-count">{product.reviews} reseñas</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
