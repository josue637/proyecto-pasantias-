import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lúmina Tech — tecnología para tu día a día",
  description:
    "Descubre audífonos, accesorios móviles y tecnología inteligente en Lúmina Tech. Envíos a todo Chile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
