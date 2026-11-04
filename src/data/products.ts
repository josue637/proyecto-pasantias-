export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  reviews: number;
  label?: string;
  image: string;
  alt: string;
};

export const products: Product[] = [
  {
    id: "florero-arcilla",
    name: "Florero Arcilla",
    category: "Cerámica artesanal",
    price: 34900,
    rating: "4.9",
    reviews: 28,
    label: "Más querido",
    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=75",
    alt: "Florero artesanal en cerámica color arena",
  },
  {
    id: "manta-sur",
    name: "Manta Sur",
    category: "Textiles de algodón",
    price: 58900,
    rating: "5.0",
    reviews: 16,
    label: "Hecho a mano",
    image:
      "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=700&q=75",
    alt: "Manta tejida en tonos neutros sobre un sillón",
  },
  {
    id: "lampara-nido",
    name: "Lámpara Nido",
    category: "Iluminación",
    price: 72900,
    rating: "4.8",
    reviews: 12,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=75",
    alt: "Lámpara de mesa de luz cálida",
  },
  {
    id: "bandeja-calma",
    name: "Bandeja Calma",
    category: "Madera nativa",
    price: 27900,
    rating: "4.9",
    reviews: 34,
    label: "Últimas unidades",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=75",
    alt: "Bandeja de madera con piezas de cerámica",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}
