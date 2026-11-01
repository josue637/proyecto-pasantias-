import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lúmina — objetos para vivir bonito",
  description:
    "Piezas con intención para transformar tus espacios. Descubre la selección de decoración y diseño de Lúmina.",
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
