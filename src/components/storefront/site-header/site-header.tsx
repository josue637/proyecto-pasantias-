"use client";

import { useState } from "react";
import {
  BagIcon,
  CloseIcon,
  LeafIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/storefront/icons";

type SiteHeaderProps = {
  cartCount: number;
  onSearch: (value: string) => void;
};

const navigation = [
  { label: "Novedades", href: "#productos" },
  { label: "Colecciones", href: "#colecciones" },
  { label: "Nuestra historia", href: "#historia" },
];

export function SiteHeader({ cartCount, onSearch }: SiteHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function updateSearch(value: string) {
    setQuery(value);
    onSearch(value);
  }

  return (
    <header className="site-header">
      <div className="header-main">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon width={21} /> : <MenuIcon width={21} />}
        </button>
        <nav className="header-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="brand" href="#" aria-label="Lúmina, inicio">
          <span className="brand-mark">
            <LeafIcon width={19} height={19} />
          </span>
          <span className="brand-name">LÚMINA</span>
        </a>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar productos"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              setCartOpen(false);
            }}
          >
            <SearchIcon width={19} height={19} />
          </button>
          <button
            className="icon-button account-button"
            type="button"
            aria-label="Mi cuenta"
          >
            <UserIcon width={19} height={19} />
          </button>
          <button
            className="icon-button cart-button"
            type="button"
            aria-label={`Bolsa de compras, ${cartCount} productos`}
            aria-expanded={cartOpen}
            onClick={() => {
              setCartOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <BagIcon width={19} height={19} />
            <span className="cart-label">Bolsa</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
      {searchOpen && (
        <div className="search-panel">
          <label htmlFor="product-search">¿Qué estás buscando?</label>
          <input
            id="product-search"
            className="search-input"
            type="search"
            placeholder="Prueba con “cerámica”"
            value={query}
            onChange={(event) => updateSearch(event.target.value)}
            autoFocus
          />
        </div>
      )}
      {cartOpen && (
        <div className="cart-panel">
          <strong>Tu bolsa</strong>
          {cartCount === 0 ? (
            <p>Aún no tienes piezas en tu bolsa. Encuentra algo que te haga sentir en casa.</p>
          ) : (
            <p>
              Tienes {cartCount} {cartCount === 1 ? "pieza" : "piezas"} agregadas. El
              checkout estará disponible en el siguiente paso.
            </p>
          )}
        </div>
      )}
    </header>
  );
}
