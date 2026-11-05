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
    id: "audifonos-pulse",
    name: "Audífonos Pulse ANC",
    category: "Audio inalámbrico",
    price: 59990,
    rating: "4.9",
    reviews: 128,
    label: "Más vendido",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=75",
    alt: "Audífonos inalámbricos compactos con estuche de carga",
  },
  {
    id: "smartwatch-active",
    name: "Smartwatch Active",
    category: "Relojes inteligentes",
    price: 79990,
    rating: "5.0",
    reviews: 86,
    label: "Nuevo",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=75",
    alt: "Reloj inteligente moderno con correa oscura",
  },
  {
    id: "powerbank-compact",
    name: "Powerbank Compact 20K",
    category: "Accesorios móviles",
    price: 29990,
    rating: "4.8",
    reviews: 74,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=75",
    alt: "Batería portátil para cargar dispositivos móviles",
  },
  {
    id: "camara-smart-home",
    name: "Cámara Smart Home",
    category: "Hogar inteligente",
    price: 44990,
    rating: "4.9",
    reviews: 53,
    label: "Favorito",
    image:
      "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=700&q=75",
    alt: "Cámara compacta de seguridad inteligente para el hogar",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}
