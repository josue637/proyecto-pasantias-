"use strict";

const storageKeys = {
  cart: "lumina-cart-count",
  favorites: "lumina-favorites",
  reviews: "lumina-product-reviews",
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
    // Keep the storefront usable when browser storage is unavailable or full.
  }
}

function normalizeText(value) {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const cartCountElement = document.querySelector("[data-cart-count]");
const cartToggle = document.querySelector("[data-cart-toggle]");
const cartPanel = document.querySelector("#cart-panel");
const cartMessage = document.querySelector("[data-cart-message]");
const searchToggle = document.querySelector("[data-search-toggle]");
const searchInput = document.querySelector("#product-search");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("#mobile-nav");
const filterForm = document.querySelector("#product-filters");
const productGrid = document.querySelector("[data-product-grid]");
const productCards = Array.from(document.querySelectorAll("[data-product]"));
const noResults = document.querySelector("[data-no-results]");
const resultsCount = document.querySelector("[data-results-count]");
const filterControls = Array.from(document.querySelectorAll("[data-filter]"));

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

cartToggle.addEventListener("click", () => {
  const shouldOpen = cartPanel.hidden;
  cartPanel.hidden = !shouldOpen;
  cartToggle.setAttribute("aria-expanded", String(shouldOpen));
});

searchToggle.addEventListener("click", () => {
  cartPanel.hidden = true;
  cartToggle.setAttribute("aria-expanded", "false");
  document.querySelector("#productos").scrollIntoView({ behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
});

function getFilterValue(name) {
  return filterControls.find((control) => control.dataset.filter === name).value;
}

function filterProducts() {
  const query = normalizeText(searchInput.value);
  const category = getFilterValue("category");
  const color = getFilterValue("color");
  const size = getFilterValue("size");
  const minPriceValue = getFilterValue("min-price");
  const maxPriceValue = getFilterValue("max-price");
  const minPrice = minPriceValue === "" ? 0 : Number(minPriceValue);
  const maxPrice = maxPriceValue === "" ? Number.POSITIVE_INFINITY : Number(maxPriceValue);
  const matches = [];

  productCards.forEach((card, index) => {
    if (card.dataset.originalOrder === undefined) {
      card.dataset.originalOrder = String(index);
    }
    const searchable = normalizeText([
      card.dataset.name,
      card.dataset.category,
      card.dataset.color,
      card.dataset.size,
      card.querySelector(".product-description").textContent,
      card.querySelector(".product-specs").textContent,
    ].join(" "));
    const price = Number(card.dataset.price);
    const isVisible = searchable.includes(query)
      && (!category || card.dataset.category === category)
      && (!color || card.dataset.color === color)
      && (!size || card.dataset.size === size)
      && price >= minPrice
      && price <= maxPrice;

    card.hidden = !isVisible;
    if (isVisible) matches.push(card);
  });

  const sortBy = getFilterValue("sort");
  matches.sort((first, second) => {
    if (sortBy === "price-asc") return Number(first.dataset.price) - Number(second.dataset.price);
    if (sortBy === "price-desc") return Number(second.dataset.price) - Number(first.dataset.price);
    if (sortBy === "rating") return Number(second.dataset.rating) - Number(first.dataset.rating);
    return Number(first.dataset.originalOrder) - Number(second.dataset.originalOrder);
  });

  matches.forEach((card) => productGrid.insertBefore(card, noResults));
  noResults.hidden = matches.length > 0;
  resultsCount.textContent = `${matches.length} ${matches.length === 1 ? "pieza encontrada" : "piezas encontradas"}`;
}

searchInput.addEventListener("input", filterProducts);
filterControls.forEach((control) => control.addEventListener("change", filterProducts));
filterControls
  .filter((control) => control.type === "number")
  .forEach((control) => control.addEventListener("input", filterProducts));

filterForm.addEventListener("reset", () => {
  window.requestAnimationFrame(filterProducts);
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

let reviews = readStorage(storageKeys.reviews, {});
if (!reviews || typeof reviews !== "object" || Array.isArray(reviews)) reviews = {};

function getProductReviews(productName) {
  const productReviews = reviews[productName];
  if (!Array.isArray(productReviews)) return [];
  return productReviews.filter((review) => (
    review
    && typeof review.name === "string"
    && typeof review.comment === "string"
    && Number.isInteger(review.rating)
    && review.rating >= 1
    && review.rating <= 5
  ));
}

function renderReviews(card) {
  const productName = card.dataset.name;
  const productReviews = getProductReviews(productName);
  const list = card.querySelector("[data-review-list]");
  const summary = card.querySelector("[data-rating-summary]");
  const average = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : 0;

  card.dataset.rating = String(average);
  summary.querySelector(".stars").textContent = `${"★".repeat(Math.round(average))}${"☆".repeat(5 - Math.round(average))}`;
  summary.querySelector("span:last-child").textContent = productReviews.length
    ? `${average.toFixed(1)} (${productReviews.length} ${productReviews.length === 1 ? "reseña" : "reseñas"})`
    : "Aún sin valoraciones";

  list.replaceChildren();
  productReviews.slice(-3).reverse().forEach((review) => {
    const item = document.createElement("li");
    const header = document.createElement("div");
    const author = document.createElement("span");
    const stars = document.createElement("span");
    const comment = document.createElement("p");

    item.className = "review-item";
    header.className = "review-item-header";
    stars.className = "stars";
    author.textContent = review.name;
    stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
    stars.setAttribute("aria-label", `${review.rating} de 5 estrellas`);
    comment.textContent = review.comment;
    header.append(author, stars);
    item.append(header, comment);
    list.append(item);
  });
}

document.querySelectorAll("[data-review-form]").forEach((form) => {
  const card = form.closest("[data-product]");
  const productName = card.dataset.name;
  const toggle = card.querySelector(".review-toggle");

  renderReviews(card);

  toggle.addEventListener("click", () => {
    const shouldOpen = form.hidden;
    form.hidden = !shouldOpen;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    if (shouldOpen) form.querySelector('[name="review-name"]').focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements.namedItem("review-name");
    const commentInput = form.elements.namedItem("review-comment");
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const ratingInput = form.querySelector('[name="rating"]:checked');

    nameInput.setCustomValidity(name ? "" : "Escribe tu nombre para publicar la reseña.");
    commentInput.setCustomValidity(comment ? "" : "Escribe tu opinión antes de publicarla.");
    if (!name || !comment || !ratingInput) {
      form.reportValidity();
      return;
    }

    nameInput.setCustomValidity("");
    commentInput.setCustomValidity("");
    reviews[productName] = [
      ...getProductReviews(productName),
      { name, comment, rating: Number(ratingInput.value) },
    ].slice(-20);
    writeStorage(storageKeys.reviews, reviews);
    renderReviews(card);
    filterProducts();
    form.reset();
    form.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
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

const video = document.querySelector(".studio-video");
const videoSource = document.querySelector("[data-video-source]");
const videoButton = document.querySelector("[data-load-video]");
const videoError = document.querySelector("[data-video-error]");

video.addEventListener("error", () => {
  videoError.hidden = false;
  videoButton.hidden = false;
  videoButton.textContent = "Reintentar video";
});

video.addEventListener("play", () => {
  videoButton.hidden = true;
  videoError.hidden = true;
});

videoButton.addEventListener("click", () => {
  if (!videoSource.src) {
    videoSource.src = videoSource.dataset.src;
    video.load();
  }

  video.play().catch(() => {
    videoError.hidden = false;
    videoButton.hidden = false;
  });
});

updateCart();
filterProducts();
