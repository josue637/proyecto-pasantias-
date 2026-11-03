"use strict";

const storageKeys = {
  cart: "lumina-cart-count",
  favorites: "lumina-favorites",
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The interface remains usable if browser storage is disabled.
  }
}

const cartCountElement = document.querySelector("[data-cart-count]");
const cartToggle = document.querySelector("[data-cart-toggle]");
const cartPanel = document.querySelector("#cart-panel");
const cartMessage = document.querySelector("[data-cart-message]");
const searchToggle = document.querySelector("[data-search-toggle]");
const searchPanel = document.querySelector("#search-panel");
const searchInput = document.querySelector("#product-search");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("#mobile-nav");
const products = Array.from(document.querySelectorAll("[data-product]"));
const noResults = document.querySelector("[data-no-results]");

let cartCount = Number(readStorage(storageKeys.cart, 0));
if (!Number.isSafeInteger(cartCount) || cartCount < 0) cartCount = 0;

function updateCart() {
  cartCountElement.textContent = String(cartCount);
  cartToggle.setAttribute("aria-label", `Bolsa de compras, ${cartCount} productos`);
  cartMessage.textContent = cartCount === 0
    ? "Aún no tienes piezas en tu bolsa. Encuentra algo que te haga sentir en casa."
    : `Tienes ${cartCount} ${cartCount === 1 ? "pieza" : "piezas"} agregadas.`;
  writeStorage(storageKeys.cart, cartCount);
}

function closePanel(panel, button) {
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
}

cartToggle.addEventListener("click", () => {
  const shouldOpen = cartPanel.hidden;
  closePanel(searchPanel, searchToggle);
  cartPanel.hidden = !shouldOpen;
  cartToggle.setAttribute("aria-expanded", String(shouldOpen));
});

searchToggle.addEventListener("click", () => {
  const shouldOpen = searchPanel.hidden;
  closePanel(cartPanel, cartToggle);
  searchPanel.hidden = !shouldOpen;
  searchToggle.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) searchInput.focus();
});

function filterProducts(value) {
  const query = value.trim().toLocaleLowerCase("es");
  let visibleCount = 0;

  products.forEach((product) => {
    const searchable = `${product.dataset.name} ${product.dataset.category}`.toLocaleLowerCase("es");
    const isVisible = searchable.includes(query);
    product.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  noResults.hidden = visibleCount > 0;
}

searchInput.addEventListener("input", (event) => {
  filterProducts(event.currentTarget.value);
});

menuToggle.addEventListener("click", () => {
  const shouldOpen = mobileNav.hidden;
  mobileNav.hidden = !shouldOpen;
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuToggle.setAttribute("aria-label", shouldOpen ? "Cerrar menú" : "Abrir menú");
  menuToggle.innerHTML = shouldOpen
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
  });
});

document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    cartCount += 1;
    updateCart();
    button.classList.add("is-added");
    button.innerHTML = 'Agregado a tu bolsa <span aria-hidden="true">✓</span>';
    window.setTimeout(() => {
      button.classList.remove("is-added");
      button.innerHTML = 'Agregar a la bolsa <span aria-hidden="true">＋</span>';
    }, 1200);
  });
});

let favoriteIds = readStorage(storageKeys.favorites, []);
if (!Array.isArray(favoriteIds)) favoriteIds = [];

document.querySelectorAll("[data-favorite]").forEach((button) => {
  const product = button.closest("[data-product]");
  const productName = product.dataset.name;
  const isFavorite = favoriteIds.includes(productName);
  button.classList.toggle("is-favorite", isFavorite);
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute("aria-label", `${isFavorite ? "Quitar" : "Agregar"} ${productName} ${isFavorite ? "de" : "a"} favoritos`);

  button.addEventListener("click", () => {
    const nowFavorite = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(nowFavorite));
    button.setAttribute("aria-label", `${nowFavorite ? "Quitar" : "Agregar"} ${productName} ${nowFavorite ? "de" : "a"} favoritos`);
    button.classList.toggle("is-favorite", nowFavorite);
    favoriteIds = nowFavorite
      ? [...favoriteIds, productName]
      : favoriteIds.filter((favorite) => favorite !== productName);
    writeStorage(storageKeys.favorites, favoriteIds);
  });
});

document.querySelector("[data-newsletter-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("[data-newsletter-message]");
  message.textContent = "¡Gracias por suscribirte! La conexión de correo se habilitará próximamente.";
  form.querySelector("input").disabled = true;
  form.querySelector("button").disabled = true;
  form.querySelector("button").textContent = "¡Gracias!";
});

updateCart();
