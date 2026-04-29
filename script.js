const statCards = document.querySelectorAll(".stat-card");
const statNumbers = document.querySelectorAll("[data-count-to]");
const storySection = document.querySelector(".our-story");
const readMoreButton = document.querySelector(".read-more");
const packageCards = document.querySelectorAll("[data-package-card]");
const detailsModal = document.querySelector("[data-details-modal]");
const detailsCloseButton = document.querySelector("[data-close-details]");
const modalTitle = document.querySelector("#packageModalTitle");
const modalDescription = document.querySelector(".package-modal__description");
const modalPrice = document.querySelector(".package-modal__price");
const modalIncludes = document.querySelector(".package-modal__list");
const modalCartButton = document.querySelector(".package-modal__cart");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const cartCloseButton = document.querySelector("[data-close-cart]");
const cartItemsContainer = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const gallerySection = document.querySelector(".gallery");
const galleryCarousel = document.querySelector("[data-gallery-carousel]");
const galleryTrack = document.querySelector("[data-gallery-track]");
const galleryDots = document.querySelector("[data-gallery-dots]");
const galleryPrevButton = document.querySelector("[data-gallery-prev]");
const galleryNextButton = document.querySelector("[data-gallery-next]");
const countriesSection = document.querySelector(".countries");
const countriesCarousel = document.querySelector("[data-countries-carousel]");
const countriesTrack = document.querySelector("[data-countries-track]");
const countriesDots = document.querySelector("[data-countries-dots]");
const countriesPrevButton = document.querySelector("[data-countries-prev]");
const countriesNextButton = document.querySelector("[data-countries-next]");
const customForm = document.querySelector("[data-custom-form]");
const customFormError = document.querySelector("[data-form-error]");
const whatsappSubmitButton = document.querySelector("[data-whatsapp-submit]");
const siteFooter = document.querySelector(".site-footer");
const navbarCountryMenu = document.querySelector("[data-country-menu]");
const navbarCountryToggle = document.querySelector("[data-country-toggle]");
const navbarCountryDropdown = document.querySelector("[data-country-dropdown]");
const navbarCountryList = document.querySelector("[data-country-list]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const premiumMenu = document.querySelector("[data-premium-menu]");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");
const menuCloseButton = document.querySelector("[data-menu-close]");
const menuLinks = document.querySelectorAll("[data-menu-link]");
const menuCountryButtons = document.querySelectorAll("[data-menu-country]");
const parallaxSections = document.querySelectorAll("[data-parallax-section]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

const enableParallax =
  !prefersReducedMotion && window.matchMedia("(min-width: 721px)").matches && parallaxSections.length;
let parallaxTicking = false;

const updateParallax = () => {
  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.bottom < 0 || rect.top > viewportHeight) {
      return;
    }

    const progress = (rect.top - viewportHeight / 2) / viewportHeight;

    if (section.classList.contains("hero")) {
      section.style.setProperty("--hero-parallax-y", `${progress * -42}px`);
    } else {
      section.style.setProperty("--section-parallax-y", `${progress * -22}px`);
    }
  });

  parallaxTicking = false;
};

const requestParallaxUpdate = () => {
  if (parallaxTicking) {
    return;
  }

  parallaxTicking = true;
  requestAnimationFrame(updateParallax);
};

if (enableParallax) {
  updateParallax();
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
}

const packages = {
  "simple-elegant": {
    name: "Simple but Elegant Surprise",
    price: 15000,
    priceLabel: "LKR 15,000",
    description: "A sweet, thoughtful setup with timeless keepsakes and full memory coverage.",
    includes: [
      "Cake (customizable)",
      "Flower bouquet / frame",
      "Photo & video coverage",
      "Final video",
      "Polaroid memory",
    ],
  },
  "on-the-go": {
    name: "Unexpected Surprise on the Go",
    price: 20000,
    priceLabel: "LKR 20,000",
    description: "A lively moving surprise with cake, flowers, fireworks or balloons, and media.",
    includes: [
      "Cake",
      "Flower bouquet",
      "Firework / balloon setup",
      "Photo & video coverage",
      "Final video",
      "Polaroid",
    ],
  },
  lightup: {
    name: "Lightup Surprise",
    price: 25000,
    priceLabel: "LKR 25,000",
    description: "A glowing romantic package with lights, roses, chocolates, balloons, and video.",
    includes: [
      "Cake",
      "Transparent box with lights",
      "Roses + chocolates",
      "Balloons",
      "Photo & video coverage",
      "Cinematic video",
    ],
  },
  flashmob: {
    name: "Flashmob Surprise",
    price: 25000,
    priceLabel: "LKR 25,000",
    description: "A dramatic celebration package with decor, cake, flowers, fireworks, and coverage.",
    includes: [
      "Balloon setup",
      "Cake",
      "Flowers",
      "Fireworks",
      "Full media coverage",
    ],
  },
  boat: {
    name: "Private Solo Boat Surprise",
    price: 86000,
    priceLabel: "LKR 86,000",
    description: "A private boat experience with live music, fireworks, decor, cake, and media.",
    includes: [
      "Boat decoration",
      "Cake",
      "Live guitarist",
      "Fireworks",
      "30 min boat ride",
      "Full media coverage",
    ],
  },
};

let cart = [];
let activePackageId = null;
let activeGalleryIndex = 0;
let galleryTimer = null;
let activeCountryIndex = 0;
let countriesTimer = null;
let touchStartX = 0;
let touchDeltaX = 0;
let countryTouchStartX = 0;
let countryTouchDeltaX = 0;

const galleryPhotos = Array.from({ length: 10 }, (_, index) => ({
  label: `Gallery Photo ${index + 1}`,
}));

const countries = [
  { code: "LK", name: "Sri Lanka", flag: "https://flagcdn.com/w160/lk.png" },
  { code: "AE", name: "United Arab Emirates", flag: "https://flagcdn.com/w160/ae.png" },
  { code: "QA", name: "Qatar", flag: "https://flagcdn.com/w160/qa.png" },
  { code: "SA", name: "Saudi Arabia", flag: "https://flagcdn.com/w160/sa.png" },
  { code: "KW", name: "Kuwait", flag: "https://flagcdn.com/w160/kw.png" },
  { code: "OM", name: "Oman", flag: "https://flagcdn.com/w160/om.png" },
  { code: "JP", name: "Japan", flag: "https://flagcdn.com/w160/jp.png" },
  { code: "AU", name: "Australia", flag: "https://flagcdn.com/w160/au.png" },
  { code: "GB", name: "United Kingdom", flag: "https://flagcdn.com/w160/gb.png" },
];

const navbarCountries = [
  { name: "Sri Lanka", flag: "🇱🇰", whatsapp: "94720626224" },
  { name: "United Arab Emirates", flag: "🇦🇪", whatsapp: "94720626224" },
  { name: "Qatar", flag: "🇶🇦", whatsapp: "94720626224" },
  { name: "Saudi Arabia", flag: "🇸🇦", whatsapp: "94720626224" },
  { name: "Kuwait", flag: "🇰🇼", whatsapp: "94720626224" },
  { name: "Oman", flag: "🇴🇲", whatsapp: "94720626224" },
  { name: "Japan", flag: "🇯🇵", whatsapp: "94720626224" },
  { name: "Australia", flag: "🇦🇺", whatsapp: "94720626224" },
  { name: "United Kingdom", flag: "🇬🇧", whatsapp: "94720626224" },
];

const formatValue = (value, decimals, suffix) => {
  const formatted = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  return `${formatted}${suffix}`;
};

const animateNumber = (element) => {
  const target = Number(element.dataset.countTo);
  const decimals = Number(element.dataset.decimals || 0);
  const suffix = element.dataset.suffix || "";
  const duration = prefersReducedMotion ? 0 : 1800;
  const startTime = performance.now();

  if (duration === 0) {
    element.textContent = formatValue(target, decimals, suffix);
    return;
  }

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * easedProgress;

    element.textContent = formatValue(currentValue, decimals, suffix);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        statCards.forEach((card) => card.classList.add("is-visible"));
        statNumbers.forEach(animateNumber);
        observer.disconnect();
      });
    },
    { threshold: 0.35 }
  );

  const statsSection = document.querySelector(".trust-stats");

  if (statsSection) {
    statsObserver.observe(statsSection);
  }
} else {
  statCards.forEach((card) => card.classList.add("is-visible"));
  statNumbers.forEach(animateNumber);
}

if (storySection && "IntersectionObserver" in window) {
  const storyObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        storySection.classList.add("is-visible");
        observer.disconnect();
      });
    },
    { threshold: 0.28 }
  );

  storyObserver.observe(storySection);
} else if (storySection) {
  storySection.classList.add("is-visible");
}

if (readMoreButton && storySection) {
  readMoreButton.addEventListener("click", () => {
    const isExpanded = storySection.classList.toggle("is-expanded");

    readMoreButton.setAttribute("aria-expanded", String(isExpanded));
    readMoreButton.textContent = isExpanded ? "Show less" : "Read more";
  });
}

if (packageCards.length && "IntersectionObserver" in window) {
  const packageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  packageCards.forEach((card) => packageObserver.observe(card));
} else {
  packageCards.forEach((card) => card.classList.add("is-visible"));
}

const getGalleryOffset = (index) => {
  const totalSlides = galleryPhotos.length;
  let offset = index - activeGalleryIndex;

  if (offset > totalSlides / 2) {
    offset -= totalSlides;
  }

  if (offset < -totalSlides / 2) {
    offset += totalSlides;
  }

  return offset;
};

const renderGallery = () => {
  if (!galleryTrack || !galleryDots) {
    return;
  }

  galleryTrack.innerHTML = galleryPhotos
    .map(
      (photo, index) => `
        <div class="gallery-slide" data-gallery-slide="${index}">
          <span class="gallery-slide__label">${photo.label}</span>
        </div>
      `
    )
    .join("");

  galleryDots.innerHTML = galleryPhotos
    .map(
      (photo, index) => `
        <button class="gallery-dot" type="button" data-gallery-dot="${index}" aria-label="Show ${photo.label}"></button>
      `
    )
    .join("");
};

const updateGallery = () => {
  const slides = document.querySelectorAll("[data-gallery-slide]");
  const dots = document.querySelectorAll("[data-gallery-dot]");

  slides.forEach((slide, index) => {
    const offset = getGalleryOffset(index);
    slide.className = "gallery-slide";

    if (offset === 0) {
      slide.classList.add("is-active");
    } else if (offset === -1) {
      slide.classList.add("is-prev");
    } else if (offset === 1) {
      slide.classList.add("is-next");
    } else if (offset === -2) {
      slide.classList.add("is-far-prev");
    } else if (offset === 2) {
      slide.classList.add("is-far-next");
    }
  });

  dots.forEach((dot, index) => {
    const isActive = index === activeGalleryIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
};

const goToGallerySlide = (index) => {
  activeGalleryIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  updateGallery();
};

const stopGalleryAutoplay = () => {
  if (galleryTimer) {
    window.clearInterval(galleryTimer);
    galleryTimer = null;
  }
};

const startGalleryAutoplay = () => {
  if (prefersReducedMotion || !galleryCarousel || galleryTimer) {
    return;
  }

  galleryTimer = window.setInterval(() => {
    goToGallerySlide(activeGalleryIndex + 1);
  }, 3600);
};

if (galleryTrack && galleryDots) {
  renderGallery();
  updateGallery();
  startGalleryAutoplay();
}

if (gallerySection && "IntersectionObserver" in window) {
  const galleryObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        gallerySection.classList.add("is-visible");
        observer.disconnect();
      });
    },
    { threshold: 0.22 }
  );

  galleryObserver.observe(gallerySection);
} else if (gallerySection) {
  gallerySection.classList.add("is-visible");
}

if (galleryPrevButton) {
  galleryPrevButton.addEventListener("click", () => {
    goToGallerySlide(activeGalleryIndex - 1);
  });
}

if (galleryNextButton) {
  galleryNextButton.addEventListener("click", () => {
    goToGallerySlide(activeGalleryIndex + 1);
  });
}

if (galleryDots) {
  galleryDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-gallery-dot]");

    if (!dot) {
      return;
    }

    goToGallerySlide(Number(dot.dataset.galleryDot));
  });
}

if (galleryCarousel) {
  galleryCarousel.addEventListener("mouseenter", stopGalleryAutoplay);
  galleryCarousel.addEventListener("mouseleave", startGalleryAutoplay);
  galleryCarousel.addEventListener("touchstart", (event) => {
    stopGalleryAutoplay();
    touchStartX = event.touches[0].clientX;
    touchDeltaX = 0;
  });
  galleryCarousel.addEventListener("touchmove", (event) => {
    touchDeltaX = event.touches[0].clientX - touchStartX;
  });
  galleryCarousel.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 42) {
      goToGallerySlide(activeGalleryIndex + (touchDeltaX < 0 ? 1 : -1));
    }

    touchStartX = 0;
    touchDeltaX = 0;
    startGalleryAutoplay();
  });
}

const renderCountries = () => {
  if (!countriesTrack || !countriesDots) {
    return;
  }

  countriesTrack.innerHTML = countries
    .map(
      (country, index) => `
        <article class="country-card" data-country-card="${index}">
          <span class="country-card__flag">
            <img src="${country.flag}" alt="${country.name} flag" loading="lazy" />
          </span>
          <h3>${country.name}</h3>
        </article>
      `
    )
    .join("");

  countriesDots.innerHTML = countries
    .map(
      (country, index) => `
        <button class="countries-dot" type="button" data-country-dot="${index}" aria-label="Show ${country.name}"></button>
      `
    )
    .join("");
};

const getCountryOffset = (index) => {
  const totalCountries = countries.length;
  let offset = index - activeCountryIndex;

  if (offset > totalCountries / 2) {
    offset -= totalCountries;
  }

  if (offset < -totalCountries / 2) {
    offset += totalCountries;
  }

  return offset;
};

const updateCountries = () => {
  if (!countriesTrack) {
    return;
  }

  const countryCards = document.querySelectorAll("[data-country-card]");
  const countryDots = document.querySelectorAll("[data-country-dot]");
  const activeCard = countryCards[activeCountryIndex];

  if (activeCard) {
    const viewport = countriesTrack.parentElement;
    const viewportWidth = viewport ? viewport.clientWidth : 0;
    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
    const translateX = viewportWidth / 2 - cardCenter;
    countriesTrack.style.transform = `translateX(${translateX}px)`;
  }

  countryCards.forEach((card, index) => {
    const offset = Math.abs(getCountryOffset(index));
    card.classList.toggle("is-active", offset === 0);
    card.classList.toggle("is-near", offset === 1 || offset === 2);
    card.classList.toggle("is-far", offset > 2);
  });

  countryDots.forEach((dot, index) => {
    const isActive = index === activeCountryIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
};

const goToCountry = (index) => {
  activeCountryIndex = (index + countries.length) % countries.length;
  updateCountries();
};

const stopCountriesAutoplay = () => {
  if (countriesTimer) {
    window.clearInterval(countriesTimer);
    countriesTimer = null;
  }
};

const startCountriesAutoplay = () => {
  if (prefersReducedMotion || !countriesCarousel || countriesTimer) {
    return;
  }

  countriesTimer = window.setInterval(() => {
    goToCountry(activeCountryIndex + 1);
  }, 3200);
};

if (countriesTrack && countriesDots) {
  renderCountries();
  updateCountries();
  window.addEventListener("resize", updateCountries);
}

if (countriesPrevButton) {
  countriesPrevButton.addEventListener("click", () => {
    goToCountry(activeCountryIndex - 1);
  });
}

if (countriesNextButton) {
  countriesNextButton.addEventListener("click", () => {
    goToCountry(activeCountryIndex + 1);
  });
}

if (countriesDots) {
  countriesDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-country-dot]");

    if (!dot) {
      return;
    }

    goToCountry(Number(dot.dataset.countryDot));
  });
}

if (countriesCarousel) {
  countriesCarousel.addEventListener("mouseenter", stopCountriesAutoplay);
  countriesCarousel.addEventListener("mouseleave", startCountriesAutoplay);
  countriesCarousel.addEventListener("touchstart", (event) => {
    stopCountriesAutoplay();
    countryTouchStartX = event.touches[0].clientX;
    countryTouchDeltaX = 0;
  });
  countriesCarousel.addEventListener("touchmove", (event) => {
    countryTouchDeltaX = event.touches[0].clientX - countryTouchStartX;
  });
  countriesCarousel.addEventListener("touchend", () => {
    if (Math.abs(countryTouchDeltaX) > 42) {
      goToCountry(activeCountryIndex + (countryTouchDeltaX < 0 ? 1 : -1));
    }

    countryTouchStartX = 0;
    countryTouchDeltaX = 0;
    startCountriesAutoplay();
  });
}

if (countriesSection && "IntersectionObserver" in window) {
  const countriesObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        countriesSection.classList.add("is-visible");
        activeCountryIndex = 0;
        updateCountries();
        startCountriesAutoplay();
        observer.disconnect();
      });
    },
    { threshold: 0.22 }
  );

  countriesObserver.observe(countriesSection);
} else if (countriesSection) {
  countriesSection.classList.add("is-visible");
  updateCountries();
  startCountriesAutoplay();
}

const formatCurrency = (value) => `LKR ${value.toLocaleString("en-US")}`;

const loadCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem("surprisewalaCart") || "[]");
    cart = Array.isArray(storedCart) ? storedCart : [];
  } catch {
    cart = [];
  }
};

const saveCart = () => {
  localStorage.setItem("surprisewalaCart", JSON.stringify(cart));
};

const updateCartBadge = () => {
  const count = cart.reduce((total, item) => total + item.quantity, 0);

  if (cartCount) {
    cartCount.textContent = String(count);
  }
};

const renderCart = () => {
  if (!cartItemsContainer || !cartEmpty || !cartTotal) {
    return;
  }

  cartItemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("article");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item__top">
        <div>
          <h3>${item.name}</h3>
          <p>${formatCurrency(item.price)}</p>
        </div>
        <button class="cart-remove" type="button" data-remove-cart="${item.id}">Remove</button>
      </div>
      <div class="cart-quantity" aria-label="Quantity for ${item.name}">
        <button type="button" data-decrease-cart="${item.id}" aria-label="Decrease quantity">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-increase-cart="${item.id}" aria-label="Increase quantity">+</button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatCurrency(total);
  cartEmpty.classList.toggle("is-visible", cart.length === 0);
  updateCartBadge();
};

const addToCart = (packageId) => {
  const selectedPackage = packages[packageId];

  if (!selectedPackage) {
    return;
  }

  const existingItem = cart.find((item) => item.id === packageId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: packageId,
      name: selectedPackage.name,
      price: selectedPackage.price,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
};

const changeQuantity = (packageId, amount) => {
  const item = cart.find((cartItem) => cartItem.id === packageId);

  if (!item) {
    return;
  }

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== packageId);
  }

  saveCart();
  renderCart();
};

const removeFromCart = (packageId) => {
  cart = cart.filter((item) => item.id !== packageId);
  saveCart();
  renderCart();
};

const openDetails = (packageId) => {
  const selectedPackage = packages[packageId];

  if (!selectedPackage || !detailsModal || !modalTitle || !modalDescription || !modalPrice || !modalIncludes || !modalCartButton) {
    return;
  }

  activePackageId = packageId;
  modalTitle.textContent = selectedPackage.name;
  modalDescription.textContent = selectedPackage.description;
  modalPrice.textContent = selectedPackage.priceLabel;
  modalIncludes.innerHTML = selectedPackage.includes.map((item) => `<li>${item}</li>`).join("");
  detailsModal.hidden = false;
  requestAnimationFrame(() => detailsModal.classList.add("is-open"));
  document.body.classList.add("modal-open");
};

const closeDetails = () => {
  if (!detailsModal) {
    return;
  }

  detailsModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    detailsModal.hidden = true;
  }, 240);
};

const openCart = () => {
  if (!cartPanel || !cartBackdrop) {
    return;
  }

  cartBackdrop.hidden = false;
  cartPanel.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    cartBackdrop.classList.add("is-open");
    cartPanel.classList.add("is-open");
  });
  document.body.classList.add("modal-open");
};

const closeCart = () => {
  if (!cartPanel || !cartBackdrop) {
    return;
  }

  cartBackdrop.classList.remove("is-open");
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    cartBackdrop.hidden = true;
  }, 260);
};

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view-package]");
  const addButton = event.target.closest("[data-add-package]");
  const decreaseButton = event.target.closest("[data-decrease-cart]");
  const increaseButton = event.target.closest("[data-increase-cart]");
  const removeButton = event.target.closest("[data-remove-cart]");

  if (viewButton) {
    openDetails(viewButton.dataset.viewPackage);
  }

  if (addButton) {
    addToCart(addButton.dataset.addPackage);
    openCart();
  }

  if (decreaseButton) {
    changeQuantity(decreaseButton.dataset.decreaseCart, -1);
  }

  if (increaseButton) {
    changeQuantity(increaseButton.dataset.increaseCart, 1);
  }

  if (removeButton) {
    removeFromCart(removeButton.dataset.removeCart);
  }
});

if (modalCartButton) {
  modalCartButton.addEventListener("click", () => {
    if (!activePackageId) {
      return;
    }

    addToCart(activePackageId);
    closeDetails();
    openCart();
  });
}

if (detailsCloseButton) {
  detailsCloseButton.addEventListener("click", closeDetails);
}

if (detailsModal) {
  detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) {
      closeDetails();
    }
  });
}

if (cartToggle) {
  cartToggle.addEventListener("click", openCart);
}

if (cartCloseButton) {
  cartCloseButton.addEventListener("click", closeCart);
}

if (cartBackdrop) {
  cartBackdrop.addEventListener("click", closeCart);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeDetails();
  closeCart();
});

loadCart();
renderCart();

if (customForm) {
  customForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(customForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const occasion = String(formData.get("occasion") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const customMessage = String(formData.get("customMessage") || "").trim();
    const requiredFields = [
      { name: "name", value: name, label: "Name" },
      { name: "phone", value: phone, label: "Phone" },
      { name: "occasion", value: occasion, label: "Occasion" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value);

    customForm.querySelectorAll(".form-field").forEach((field) => {
      const input = field.querySelector("input, select, textarea");
      field.classList.toggle(
        "is-invalid",
        Boolean(input && missingFields.some((missingField) => missingField.name === input.name))
      );
    });

    if (missingFields.length) {
      if (customFormError) {
        customFormError.textContent = `Please fill: ${missingFields
          .map((field) => field.label)
          .join(", ")}.`;
      }
      return;
    }

    if (customFormError) {
      customFormError.textContent = "";
    }

    const message = `Hello Surprisewala, I would like to plan a customized surprise.

Name: ${name}
Phone: ${phone}
Country: ${country}
Occasion: ${occasion}
Date & Time: ${date}
Location: ${location}
Budget: ${budget}

My Idea:
${customMessage}

Please send me more details.`;

    const url = "https://wa.me/94720626224?text=" + encodeURIComponent(message);

    if (whatsappSubmitButton) {
      whatsappSubmitButton.classList.add("is-loading");
      whatsappSubmitButton.textContent = "Opening WhatsApp...";
    }

    window.setTimeout(() => {
      window.open(url, "_blank");

      if (whatsappSubmitButton) {
        whatsappSubmitButton.classList.remove("is-loading");
        whatsappSubmitButton.textContent = "Send on WhatsApp";
      }
    }, 450);
  });
}

const closeNavbarCountryMenu = () => {
  if (!navbarCountryMenu || !navbarCountryToggle || !navbarCountryDropdown) {
    return;
  }

  navbarCountryMenu.classList.remove("is-open");
  navbarCountryDropdown.classList.remove("is-open");
  navbarCountryToggle.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!navbarCountryDropdown.classList.contains("is-open")) {
      navbarCountryDropdown.hidden = true;
    }
  }, 180);
};

const openNavbarCountryMenu = () => {
  if (!navbarCountryMenu || !navbarCountryToggle || !navbarCountryDropdown) {
    return;
  }

  navbarCountryDropdown.hidden = false;
  requestAnimationFrame(() => {
    navbarCountryMenu.classList.add("is-open");
    navbarCountryDropdown.classList.add("is-open");
  });
  navbarCountryToggle.setAttribute("aria-expanded", "true");
};

if (navbarCountryList) {
  navbarCountryList.innerHTML = navbarCountries
    .map(
      (country, index) => `
        <button class="country-option" type="button" data-navbar-country="${index}">
          <span class="country-option__flag" aria-hidden="true">${country.flag}</span>
          <span class="country-option__name">${country.name}</span>
        </button>
      `
    )
    .join("");
}

if (navbarCountryToggle) {
  navbarCountryToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (navbarCountryDropdown && navbarCountryDropdown.classList.contains("is-open")) {
      closeNavbarCountryMenu();
    } else {
      openNavbarCountryMenu();
    }
  });
}

if (navbarCountryList) {
  navbarCountryList.addEventListener("click", (event) => {
    const countryButton = event.target.closest("[data-navbar-country]");

    if (!countryButton) {
      return;
    }

    const country = navbarCountries[Number(countryButton.dataset.navbarCountry)];

    if (!country) {
      return;
    }

    const message = `Hello Surprisewala, I’m interested in planning a surprise from ${country.name}. Please send me more details.`;
    const url = `https://wa.me/${country.whatsapp}?text=${encodeURIComponent(message)}`;

    closeNavbarCountryMenu();
    window.open(url, "_blank");
  });
}

document.addEventListener("click", (event) => {
  if (!navbarCountryMenu || navbarCountryMenu.contains(event.target)) {
    return;
  }

  closeNavbarCountryMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavbarCountryMenu();
  }
});

const openPremiumMenu = () => {
  if (!premiumMenu || !menuBackdrop || !menuToggle) {
    return;
  }

  menuBackdrop.hidden = false;
  premiumMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    premiumMenu.classList.add("is-open");
    menuBackdrop.classList.add("is-open");
  });
  document.body.classList.add("modal-open");
};

const closePremiumMenu = () => {
  if (!premiumMenu || !menuBackdrop || !menuToggle) {
    return;
  }

  premiumMenu.classList.remove("is-open");
  menuBackdrop.classList.remove("is-open");
  premiumMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("modal-open");
  window.setTimeout(() => {
    menuBackdrop.hidden = true;
  }, 240);
};

const scrollToMenuTarget = (href) => {
  if (href === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const target = document.querySelector(href === "#custom-package" ? "#customize" : href);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    if (premiumMenu && premiumMenu.classList.contains("is-open")) {
      closePremiumMenu();
    } else {
      closeNavbarCountryMenu();
      openPremiumMenu();
    }
  });
}

if (menuCloseButton) {
  menuCloseButton.addEventListener("click", closePremiumMenu);
}

if (menuBackdrop) {
  menuBackdrop.addEventListener("click", closePremiumMenu);
}

menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || "#";

    if (href.startsWith("#")) {
      event.preventDefault();
      closePremiumMenu();
      window.setTimeout(() => scrollToMenuTarget(href), 240);
    }
  });
});

menuCountryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const countryName = button.dataset.menuCountry || "";
    const message = `Hello Surprisewala, I’m interested in planning a surprise from ${countryName}. Please send me more details.`;
    const url = "https://wa.me/94720626224?text=" + encodeURIComponent(message);

    closePremiumMenu();
    window.open(url, "_blank");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePremiumMenu();
  }
});

if (siteFooter && "IntersectionObserver" in window) {
  const footerObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        siteFooter.classList.add("is-visible");
        observer.disconnect();
      });
    },
    { threshold: 0.18 }
  );

  footerObserver.observe(siteFooter);
} else if (siteFooter) {
  siteFooter.classList.add("is-visible");
}
