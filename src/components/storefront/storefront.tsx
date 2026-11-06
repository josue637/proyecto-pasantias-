"use client";

import { useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar/announcement-bar";
import { Benefits } from "@/components/storefront/benefits/benefits";
import { CategoryGrid } from "@/components/storefront/category-grid/category-grid";
import { Contact } from "@/components/storefront/contact/contact";
import { FeaturedProducts } from "@/components/storefront/featured-products/featured-products";
import { Hero } from "@/components/storefront/hero/hero";
import { Newsletter } from "@/components/storefront/newsletter/newsletter";
import { ReviewHighlights } from "@/components/storefront/review-highlights/review-highlights";
import { SiteFooter } from "@/components/storefront/site-footer/site-footer";
import { SiteHeader } from "@/components/storefront/site-header/site-header";
import { Story } from "@/components/storefront/story/story";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";

export function Storefront() {
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumina_cart");
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) =>
            typeof item?.id === "string" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
      ) {
        setCartItems(parsed);
      }
    } catch (error) {
      console.error("No se pudo restaurar el carrito guardado.", error);
    }
  }, []);

  function addToCart(productId: string) {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === productId);
      const next = existing
        ? current.map((item) =>
            item.id === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
              : item,
          )
        : [...current, { id: productId, quantity: 1 }];
      localStorage.setItem("lumina_cart", JSON.stringify(next));
      return next;
    });
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader cartCount={cartCount} query={query} onSearch={setQuery} />
      <main>
        <Hero />
        <Benefits />
        <CategoryGrid />
        <FeaturedProducts
          query={query}
          onQueryChange={setQuery}
          onAdd={addToCart}
        />
        <ReviewHighlights />
        <Story />
        <Newsletter />
        <Contact />
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
