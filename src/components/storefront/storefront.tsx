"use client";

import { useState } from "react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar/announcement-bar";
import { Benefits } from "@/components/storefront/benefits/benefits";
import { CategoryGrid } from "@/components/storefront/category-grid/category-grid";
import { FeaturedProducts } from "@/components/storefront/featured-products/featured-products";
import { Hero } from "@/components/storefront/hero/hero";
import { Newsletter } from "@/components/storefront/newsletter/newsletter";
import { SiteFooter } from "@/components/storefront/site-footer/site-footer";
import { SiteHeader } from "@/components/storefront/site-header/site-header";
import { Story } from "@/components/storefront/story/story";

export function Storefront() {
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");

  return (
    <>
      <AnnouncementBar />
      <SiteHeader cartCount={cartCount} onSearch={setQuery} />
      <main>
        <Hero />
        <Benefits />
        <CategoryGrid />
        <FeaturedProducts query={query} onAdd={() => setCartCount((count) => count + 1)} />
        <Story />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
