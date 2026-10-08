(() => {
const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


const safeAsset = (value) => {
  if (!value) return '';
  if (/^\/(?!\/)/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};
const storefrontData = (() => {
  try { return JSON.parse(document.querySelector('#storefront-data')?.textContent || '{}'); } catch { return {}; }
})();
const storefrontSettings = Object.fromEntries((storefrontData.site_settings || []).map((setting) => [setting.key, setting.value]));
const statCards = document.querySelectorAll(".stat-card");
const statNumbers = document.querySelectorAll("[data-count-to]");
const storySection = document.querySelector(".our-story");
const purposeSection = document.querySelector(".purpose");
const readMoreButton = document.querySelector(".read-more");
const packageCards = document.querySelectorAll("[data-package-card]");
const packageFilterButtons = document.querySelectorAll("[data-package-filter]");
const packageEmptyMessage = document.querySelector("[data-package-empty]");
const packagesSection = document.querySelector("#packages");
const packageCategoryHashMap = Object.fromEntries([['#packages', 'all'], ...(storefrontData.collections || []).map((collection) => ['#' + collection.slug, collection.slug])]);
const detailsModal = document.querySelector("[data-details-modal]");
const detailsCloseButton = document.querySelector("[data-close-details]");
const modalTitle = document.querySelector("#packageModalTitle");
const modalBadge = document.querySelector(".package-modal__badge");
const modalDescription = document.querySelector(".package-modal__description");
const modalPrice = document.querySelector(".package-modal__price");
const modalNote = document.querySelector(".package-modal__note");
const modalIncludes = document.querySelector(".package-modal__list");
const modalCartButton = document.querySelector(".package-modal__cart");
const modalPhoto = document.querySelector("[data-package-modal-photo]");
const modalVideo = document.querySelector("[data-package-modal-video]");
const modalMedia = document.querySelector(".package-modal__media");
const cakeModal = document.querySelector("[data-cake-modal]");
const cakeModalTitle = document.querySelector("[data-cake-title]");
const cakeWeightInputs = document.querySelectorAll("[data-cake-weight]");
const cakeTopperInputs = document.querySelectorAll("[data-cake-topper]");
const cakeWordingInput = document.querySelector("[data-cake-wording]");
const cakeSummary = document.querySelector("[data-cake-summary]");
const cakeSummaryMedia = document.querySelector("[data-cake-summary-media]");
const cakeError = document.querySelector("[data-cake-error]");
const cakeCheckoutButton = document.querySelector("[data-cake-checkout]");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const cartCloseButton = document.querySelector("[data-close-cart]");
const cartItemsContainer = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const checkoutOpenButton = document.querySelector("[data-open-checkout]");
const directOrderModal = document.querySelector("[data-direct-order-modal]");
const directOrderCloseButton = document.querySelector("[data-close-direct-order]");
const directOrderForm = document.querySelector("[data-direct-order-form]");
const directOrderDateInput = document.querySelector("#directPreferredDate");
const directOrderError = document.querySelector("[data-direct-order-error]");
const directOrderSummary = document.querySelector("[data-direct-order-summary]");
const directPackageCost = document.querySelector("[data-direct-package-cost]");
const checkoutModal = document.querySelector("[data-checkout-modal]");
const checkoutCloseButton = document.querySelector("[data-close-checkout]");
const checkoutDetailsStep = document.querySelector("[data-checkout-details]");
const checkoutPaymentStep = document.querySelector("[data-checkout-payment]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const checkoutDateInput = document.querySelector("#preferredDate");
const preferredTimeWrapper = document.querySelector(".preferred-time-wrapper");
const checkoutError = document.querySelector("[data-checkout-error]");
const checkoutSummary = document.querySelector("[data-checkout-summary]");
const checkoutPackageCost = document.querySelector("[data-checkout-package-cost]");
const checkoutTotal = document.querySelector("[data-checkout-total]");
const checkoutPackageCost = document.querySelector("[data-checkout-package-cost]");
const paymentSummary = document.querySelector("[data-payment-summary]");
const paymentTotal = document.querySelector("[data-payment-total]");
const customerSummary = document.querySelector("[data-customer-summary]");
const paymentMethodButtons = document.querySelectorAll("[data-payment-method]");
const installmentMethods = document.querySelector("[data-installment-methods]");
const installmentMethodButtons = document.querySelectorAll("[data-installment-method]");
const paymentBreakdownContainer = document.querySelector("[data-payment-breakdown]");
const bankDetails = document.querySelector("[data-bank-details]");
const copyAccountButton = document.querySelector("[data-copy-account]");
const bankAccountNumber = document.querySelector("[data-bank-account]");
const confirmWhatsappButton = document.querySelector("[data-confirm-whatsapp]");
const backToCartButton = document.querySelector("[data-back-to-cart]");
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
const customDateInput = document.querySelector("#customPreferredDate");
const customFormError = document.querySelector("[data-form-error]");
const whatsappSubmitButton = document.querySelector("[data-whatsapp-submit]");
const siteFooter = document.querySelector(".site-footer");
const navbarCountryMenu = document.querySelector("[data-country-menu]");
const navbarCountryToggle = document.querySelector("[data-country-toggle]");
const navbarCountryDropdown = document.querySelector("[data-country-dropdown]");
const navbarCountryList = document.querySelector("[data-country-list]");
const navbarCountryClose = document.querySelector("[data-country-close]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const premiumMenu = document.querySelector("[data-premium-menu]");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");
const menuCloseButton = document.querySelector("[data-menu-close]");
const menuLinks = document.querySelectorAll("[data-menu-link]");
const menuPackageFilterLinks = document.querySelectorAll("[data-menu-package-filter]");
const parallaxSections = document.querySelectorAll("[data-parallax-section]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SURPRISEWALA_WHATSAPP_NUMBER = (storefrontSettings.whatsapp || '').replace(/\D/g, '');
const SURPRISEWALA_WHATSAPP_URL = `https://wa.me/${SURPRISEWALA_WHATSAPP_NUMBER}`;

document.documentElement.classList.add("js");

const setSriLankaDateMinimum = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
  const value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  document.querySelectorAll('input[name="surprise_date"]').forEach((input) => input.setAttribute("min", value));
};
setSriLankaDateMinimum();

document.querySelectorAll('select[name="surprise_type"], select[name="recipient_relationship"]').forEach((select) => {
  const field = select.closest('form')?.querySelector(select.name === 'surprise_type' ? '[data-other-surprise]' : '[data-other-relationship]');
  const update = () => { if (field) { field.hidden = select.value !== 'Other'; field.querySelector('input').required = select.value === 'Other'; } };
  select.addEventListener('change', update);
  select.closest('form')?.addEventListener('reset', () => setTimeout(update));
  update();
});

fetch("/api/me").then((response) => response.json()).then((me) => {
  if (!me?.authenticated || !me.profile) return;
  document.querySelectorAll('input[name="customer_name"]').forEach((input) => { if (!input.value) input.value = me.profile.full_name || ""; });
  document.querySelectorAll('input[name="customer_phone"]').forEach((input) => { if (!input.value) input.value = me.profile.phone || ""; });
  document.querySelectorAll('input[name="customer_email"]').forEach((input) => { if (!input.value) input.value = me.profile.email || ""; });
}).catch(() => undefined);

const openSurprisewalaWhatsapp = (message) => {
  const url = message ? `${SURPRISEWALA_WHATSAPP_URL}?text=${encodeURIComponent(message)}` : SURPRISEWALA_WHATSAPP_URL;
  if (!SURPRISEWALA_WHATSAPP_NUMBER) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

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

const packages = Object.fromEntries((storefrontData.packages || []).filter((pack) => pack.order_mode !== 'cake').map((pack) => {
  const images = (storefrontData.package_images || []).filter((image) => image.package_id === pack.id).map((image) => ({ src: safeAsset(image.image_path), alt: image.alt_text || pack.name })).filter((image) => image.src);
  return [pack.id, { name: pack.name, badge: pack.badge, price: pack.price, priceLabel: pack.order_mode === 'cart' && pack.price !== null ? 'LKR ' + Number(pack.price).toLocaleString('en-US') : 'Can be customized', note: pack.price_note, description: pack.description, order_mode: pack.order_mode, image: pack.main_image ? {src: safeAsset(pack.main_image), alt: pack.name} : null, images, video: pack.video_url ? {src: safeAsset(pack.video_url), label: pack.name + ' video', orientation: pack.video_orientation || 'portrait'} : null, includes: (storefrontData.package_items || []).filter((item) => item.package_id === pack.id).map((item) => item.label) }];
}));

let cart = [];
let activePackageId = null;
let activeDirectOrderPackageId = null;
let activeCakeId = null;
let selectedCakeWeight = "";
let selectedCakeTopper = "";
let checkoutCustomerDetails = null;
let checkoutSubmissionKey = null;
let directSubmissionKey = null;
let bookingSaveInFlight = false;
let selectedPaymentMethod = "bank";
let selectedInstallmentMethod = "koko";
let activeGalleryIndex = 0;
let galleryTimer = null;
let activeCountryIndex = 0;
let countriesTimer = null;
let activeModalImages = [];
let activeModalImageIndex = 0;
let touchStartX = 0;
let touchDeltaX = 0;
let countryTouchStartX = 0;
let countryTouchDeltaX = 0;

const galleryPhotos = (storefrontData.gallery_items || []).map((item) => ({type: item.media_type, src: safeAsset(item.image_path), label: item.title || item.caption || 'Surprisewala gallery moment'})).filter((item) => item.src);

const countries = [
  { code: "LK", name: "Sri Lanka", flag: "/assets-1/flags/lk.png" },
  { code: "AE", name: "United Arab Emirates", flag: "/assets-1/flags/ae.png" },
  { code: "QA", name: "Qatar", flag: "/assets-1/flags/qa.png" },
  { code: "SA", name: "Saudi Arabia", flag: "/assets-1/flags/sa.png" },
  { code: "KW", name: "Kuwait", flag: "/assets-1/flags/kw.png" },
  { code: "OM", name: "Oman", flag: "/assets-1/flags/om.png" },
  { code: "JP", name: "Japan", flag: "/assets-1/flags/jp.png" },
  { code: "AU", name: "Australia", flag: "/assets-1/flags/au.png" },
  { code: "GB", name: "United Kingdom", flag: "/assets-1/flags/gb.png" },
];

const navbarCountries = [
  { name: "Sri Lanka", flag: "/assets-1/flags/lk.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "United Arab Emirates", flag: "/assets-1/flags/ae.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Qatar", flag: "/assets-1/flags/qa.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Saudi Arabia", flag: "/assets-1/flags/sa.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Kuwait", flag: "/assets-1/flags/kw.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Oman", flag: "/assets-1/flags/om.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Japan", flag: "/assets-1/flags/jp.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "Australia", flag: "/assets-1/flags/au.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
  { name: "United Kingdom", flag: "/assets-1/flags/gb.png", whatsapp: SURPRISEWALA_WHATSAPP_NUMBER },
];

const cakes = Object.fromEntries((storefrontData.packages || []).filter((pack) => pack.order_mode === 'cake').map((pack) => [pack.id, {name: pack.name, image: safeAsset(pack.main_image)}]));

const paymentMethods = {
  card: {
    name: "Card Payment",
    feeLabel: "Card Fee 4%",
    feePercentage: 0.04,
    actionLabel: "Pay Now",
  },
  bank: {
    name: "Bank Transfer",
    feeLabel: "Extra Charge",
    feePercentage: 0,
    actionLabel: "Confirm Order",
  },
  koko: {
    name: "Koko",
    feeLabel: "Koko Processing Fee 9%",
    feePercentage: 0.09,
    actionLabel: "Pay Now",
  },
  mintpay: {
    name: "Mintpay",
    feeLabel: "Mintpay Processing Fee 4%",
    feePercentage: 0.04,
    actionLabel: "Pay Now",
  },
};

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

if (purposeSection && "IntersectionObserver" in window) {
  const purposeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        purposeSection.classList.add("is-visible");
        observer.disconnect();
      });
    },
    { threshold: 0.24 }
  );

  purposeObserver.observe(purposeSection);
} else if (purposeSection) {
  purposeSection.classList.add("is-visible");
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

const filterPackages = (filter) => {
  let visibleCount = 0;

  packageCards.forEach((card) => {
    const categories = (card.dataset.category || "")
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);
    const shouldShow = filter === "all" || categories.includes(filter);

    if (shouldShow) {
      visibleCount += 1;
      card.classList.remove("is-hidden");
      requestAnimationFrame(() => {
        card.classList.remove("is-filtering-out");
      });
    } else {
      card.classList.add("is-filtering-out");
      window.setTimeout(() => {
        if (card.classList.contains("is-filtering-out")) {
          card.classList.add("is-hidden");
        }
      }, 240);
    }
  });

  if (packageEmptyMessage) {
    packageEmptyMessage.hidden = visibleCount > 0;
    packageEmptyMessage.classList.toggle("is-visible", visibleCount === 0);
  }
};

const activatePackageFilter = (filter = "all") => {
  packageFilterButtons.forEach((filterButton) => {
    filterButton.classList.toggle("is-active", filterButton.dataset.packageFilter === filter);
  });

  menuPackageFilterLinks.forEach((filterLink) => {
    filterLink.classList.toggle("is-active", filterLink.dataset.menuPackageFilter === filter);
  });

  filterPackages(filter);
};

activatePackageFilter(storefrontData.initial_collection || 'all');

packageFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.packageFilter || "all";

    if (window.location.pathname.startsWith('/collections/')) {
      window.location.assign(filter === 'all' ? '/#packages' : '/collections/' + encodeURIComponent(filter) + '#packages');
      return;
    }
    activatePackageFilter(filter);
  });
});

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
      (photo, index) => {
        const media =
          photo.type === "video"
            ? `
              <video class="gallery-slide__media" controls playsinline preload="metadata" aria-label="${escapeHtml(photo.label)}">
                <source src="${escapeHtml(photo.src)}" type="video/mp4" />
              </video>
            `
            : `<img class="gallery-slide__media" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.label)}" loading="lazy" decoding="async" />`;

        return `
        <div class="gallery-slide" data-gallery-slide="${index}">
          ${media}
        </div>
      `;
      }
    )
    .join("");

  galleryDots.innerHTML = galleryPhotos
    .map(
      (photo, index) => `
        <button class="gallery-dot" type="button" data-gallery-dot="${index}" aria-label="Show ${escapeHtml(photo.label)}"></button>
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
  if (!galleryPhotos.length) return;
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
  if (prefersReducedMotion || !galleryCarousel || galleryPhotos.length < 2 || galleryTimer) {
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
            <img src="${country.flag}" alt="${country.name} flag" loading="lazy" decoding="async" />
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

const cartEnabledPackageIds = new Set((storefrontData.packages || []).filter((pack) => pack.order_mode === 'cart' && pack.price !== null).map((pack) => pack.id));

const canAddPackageToCart = (packageId) => cartEnabledPackageIds.has(packageId);


const loadCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem("surprisewalaCart") || "[]");
    cart = Array.isArray(storedCart) ? storedCart.flatMap((item) => {
      const pack = packages[item.id];
      if (!pack || pack.order_mode !== 'cart' || pack.price === null) return [];
      const quantity = Math.min(20, Math.max(1, Number(item.quantity) || 1));
      return [{...item, id: item.id, name: pack.name, price: Number(pack.price), quantity: Math.floor(quantity)}];
    }) : [];
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

const getCartItemDetails = (item) => {
  if (item.type !== "cake") {
    return "";
  }

  return [
    `Type: Cake`,
    `Weight: ${escapeHtml(item.weight)}`,
    item.topper ? `Topper: ${escapeHtml(item.topper)}` : "Topper: Not selected",
    item.wording ? `Wording: ${escapeHtml(item.wording)}` : "Wording: Not provided",
  ].join("<br>");
};

const getCartItemImage = (item, className) => {
  if (item.type !== "cake" || !item.image) {
    return "";
  }

  const itemName = escapeHtml(item.name);
  const imagePath = escapeHtml(item.image);

  return `
    <figure class="${className}">
      <img src="${imagePath}" alt="${itemName}" loading="lazy" decoding="async" onerror="this.closest('figure').hidden = true" />
    </figure>
  `;
};

const getCartItemText = (item) => {
  if (item.type !== "cake") {
    return `${item.name} x ${item.quantity}`;
  }

  return `${item.name} (${item.weight}, ${item.topper || "No topper"}, Wording: ${
    item.wording || "Not provided"
  }) x ${item.quantity}`;
};

const syncPackageActionButtons = () => {
  document.querySelectorAll("[data-add-package]").forEach((button) => {
    const packageId = button.dataset.addPackage;

    if (canAddPackageToCart(packageId)) {
      button.textContent = "Add to Cart";
      return;
    }

    button.textContent = "Book Now";
    button.dataset.orderPackage = packageId;
    delete button.dataset.addPackage;
  });
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
        ${getCartItemImage(item, "cart-item__image")}
        <div class="cart-item__content">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${getCartUnitPriceLabel(item)}</p>
          ${getCartItemDetails(item) ? `<p class="cart-item__details">${getCartItemDetails(item)}</p>` : ""}
        </div>
        <button class="cart-remove" type="button" data-remove-cart="${escapeHtml(item.id)}">Remove</button>
      </div>
      <div class="cart-quantity" aria-label="Quantity for ${escapeHtml(item.name)}">
        <button type="button" data-decrease-cart="${escapeHtml(item.id)}" aria-label="Decrease quantity">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-increase-cart="${escapeHtml(item.id)}" aria-label="Increase quantity">+</button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  cartTotal.textContent = getCartTotalLabel();
  cartEmpty.classList.toggle("is-visible", cart.length === 0);
  updateCartBadge();

  if (checkoutModal && !checkoutModal.hidden) {
    updateCheckoutTimeField();
    renderCheckoutSummaries();
  }
};

const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

const isCakeItem = (item) =>
  item?.productType === "cake" ||
  item?.type === "cake" ||
  item?.category === "cakes" ||
  item?.category === "Cakes";

const cartHasCustomizedPricing = () => cart.some(isCakeItem);

const getCartUnitPriceLabel = (item) => (isCakeItem(item) ? "Customized" : formatCurrency(item.price));

const getCartLinePriceLabel = (item) =>
  isCakeItem(item) ? "Customized" : formatCurrency(item.price * item.quantity);

const getCartTotalLabel = () => (cartHasCustomizedPricing() ? "Customized" : formatCurrency(getCartTotal()));

const isCakeOnlyOrder = () => cart.length > 0 && cart.every(isCakeItem);

const updateCheckoutTimeField = () => {
  const cakeOnlyOrder = false;

  if (!preferredTimeWrapper) {
    return;
  }

  const timeInput = preferredTimeWrapper.querySelector('input[name="surprise_time"]');
  preferredTimeWrapper.hidden = cakeOnlyOrder;
  preferredTimeWrapper.style.display = cakeOnlyOrder ? "none" : "";

  if (!timeInput) {
    return;
  }

  if (cakeOnlyOrder) {
    timeInput.value = "";
    timeInput.removeAttribute("required");
  } else {
    timeInput.setAttribute("required", "required");
  }
};

const getPaymentBreakdown = () => {
  const methodKey = "bank";
  const method = paymentMethods[methodKey] || paymentMethods.card;
  const originalTotal = getCartTotal();
  const feeAmount = Math.round(originalTotal * method.feePercentage);
  const finalTotal = originalTotal + feeAmount;

  return {
    methodKey,
    method,
    originalTotal,
    feeAmount,
    finalTotal,
  };
};

const renderPaymentDetails = () => {
  const breakdown = getPaymentBreakdown();

  paymentMethodButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.paymentMethod === selectedPaymentMethod);
  });

  installmentMethodButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.installmentMethod === selectedInstallmentMethod);
  });

  if (installmentMethods) {
    installmentMethods.hidden = selectedPaymentMethod !== "installment";
  }

  if (paymentBreakdownContainer) {
    paymentBreakdownContainer.innerHTML = `
      <div><span>Payment Method</span><strong>${breakdown.method.name}</strong></div>
      <div><span>Original Total</span><strong>${cartHasCustomizedPricing() ? "Customized" : formatCurrency(breakdown.originalTotal)}</strong></div>
      <div><span>${breakdown.method.feeLabel}</span><strong>${cartHasCustomizedPricing() ? "Calculated after customization" : formatCurrency(breakdown.feeAmount)}</strong></div>
      <div class="payment-breakdown__final"><span>Final Payable Total</span><strong>${cartHasCustomizedPricing() ? "Customized" : formatCurrency(breakdown.finalTotal)}</strong></div>
    `;
  }

  if (bankDetails) {
    bankDetails.hidden = selectedPaymentMethod !== "bank";
  }

  if (confirmWhatsappButton) {
    confirmWhatsappButton.textContent = 'Confirm on WhatsApp';
  }

  if (paymentTotal) {
    paymentTotal.textContent = cartHasCustomizedPricing() ? "Customized" : formatCurrency(breakdown.finalTotal);
  }
};

const getCartItemsText = () =>
  cart
    .map((item) => `- ${getCartItemText(item)} - ${getCartLinePriceLabel(item)}`)
    .join("\n");

const parseCheckoutDate = (value) => {
  const trimmedValue = String(value || "").trim();
  const displayMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const nativeMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2})?$/);

  const day = displayMatch ? Number(displayMatch[1]) : nativeMatch ? Number(nativeMatch[3]) : 0;
  const month = displayMatch ? Number(displayMatch[2]) : nativeMatch ? Number(nativeMatch[2]) : 0;
  const year = displayMatch ? Number(displayMatch[3]) : nativeMatch ? Number(nativeMatch[1]) : 0;

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return {
    day,
    month,
    year,
    formatted: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
  };
};

const formatDisplayDate = (value) => parseCheckoutDate(value)?.formatted || String(value || "").trim();

const formatDisplayTime = (value) => {
  const trimmedValue = String(value || "").trim();
  const timeMatch = trimmedValue.match(/(?:T|^)(\d{2}):(\d{2})/);

  if (!timeMatch) {
    return trimmedValue;
  }

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return trimmedValue;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatCheckoutDate = formatDisplayDate;

const formatCheckoutDateTyping = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
};

const renderSummaryItems = (container) => {
  if (!container) {
    return;
  }

  if (!cart.length) {
    container.innerHTML = `<p class="checkout-summary__empty">Your cart is empty.</p>`;
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
        <article class="checkout-summary__item">
          ${getCartItemImage(item, "checkout-summary__image")}
          <div class="checkout-summary__content">
            <h4>${escapeHtml(item.name)}</h4>
            <p>Qty ${item.quantity} x ${getCartUnitPriceLabel(item)}</p>
            ${getCartItemDetails(item) ? `<p>${getCartItemDetails(item)}</p>` : ""}
          </div>
          <strong>${getCartLinePriceLabel(item)}</strong>
        </article>
      `
    )
    .join("");
};

const renderCustomerSummary = () => {
  if (!customerSummary || !checkoutCustomerDetails) {
    return;
  }

  const details = checkoutCustomerDetails;
  customerSummary.innerHTML = `
    <dl>
      <div><dt>Name</dt><dd>${escapeHtml(details.customer_name)}</dd></div>
      <div><dt>Phone</dt><dd>${escapeHtml(details.customer_phone)}</dd></div>
      ${details.customer_email ? `<div><dt>Email</dt><dd>${escapeHtml(details.customer_email)}</dd></div>` : ""}
      <div><dt>Surprise</dt><dd>${escapeHtml(details.surprise_type)}</dd></div>
      <div><dt>Date & Time</dt><dd>${escapeHtml(details.surprise_date)} ${escapeHtml(details.surprise_time)}</dd></div>
      <div><dt>Location</dt><dd>${escapeHtml(details.surprise_location)}</dd></div>
      <div><dt>Surprise person</dt><dd>${escapeHtml(details.recipient_name)} · ${escapeHtml(details.recipient_relationship)}</dd></div>
      ${details.special_notes ? `<div><dt>Notes</dt><dd>${escapeHtml(details.special_notes)}</dd></div>` : ""}
    </dl>
  `;
};

const renderCheckoutSummaries = () => {
  renderSummaryItems(checkoutSummary);
  renderSummaryItems(paymentSummary);
  if (checkoutPackageCost) checkoutPackageCost.value = getCartTotalLabel();

  if (checkoutPackageCost) checkoutPackageCost.value = cartHasCustomizedPricing() ? "Custom / To Be Confirmed" : getCartTotalLabel();

  const total = getCartTotalLabel();

  if (checkoutTotal) {
    checkoutTotal.textContent = total;
  }

  renderCustomerSummary();
  renderPaymentDetails();
};

const showCheckoutStep = (step) => {
  const showPayment = step === "payment";

  if (checkoutDetailsStep) {
    checkoutDetailsStep.hidden = showPayment;
  }

  if (checkoutPaymentStep) {
    checkoutPaymentStep.hidden = !showPayment;
  }
};

const openCheckout = () => {
  if (!checkoutModal) {
    return;
  }

  if (!cart.length) {
    openCart();
    return;
  }

  checkoutSubmissionKey = crypto.randomUUID();
  closeCart();
  updateCheckoutTimeField();
  renderCheckoutSummaries();
  showCheckoutStep("details");
  checkoutModal.hidden = false;
  requestAnimationFrame(() => {
    updateCheckoutTimeField();
    checkoutModal.classList.add("is-open");
  });
  document.body.classList.add("modal-open");
};

const closeCheckout = () => {
  if (!checkoutModal) {
    return;
  }

  checkoutModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    if (!checkoutModal.classList.contains("is-open")) {
      checkoutModal.hidden = true;
    }
  }, 220);
};

const getCheckoutDetails = () => {
  if (!checkoutForm) {
    return null;
  }

  const formData = new FormData(checkoutForm);

  return { customer_name: String(formData.get("customer_name") || "").trim(), customer_phone: String(formData.get("customer_phone") || "").trim(), customer_email: String(formData.get("customer_email") || "").trim(), surprise_date: String(formData.get("surprise_date") || "").trim(), surprise_location: String(formData.get("surprise_location") || "").trim(), surprise_time: String(formData.get("surprise_time") || "").trim(), surprise_type: String(formData.get("surprise_type") || "").trim(), custom_surprise_type: String(formData.get("custom_surprise_type") || "").trim(), recipient_name: String(formData.get("recipient_name") || "").trim(), recipient_phone: String(formData.get("recipient_phone") || "").trim(), recipient_relationship: String(formData.get("recipient_relationship") || "").trim(), custom_relationship: String(formData.get("custom_relationship") || "").trim(), special_notes: String(formData.get("special_notes") || "").trim() };
};

const validateCheckoutDetails = (details) => {
  const requiredFields = ["customer_name", "customer_phone", "surprise_date", "surprise_location", "surprise_time", "surprise_type", "recipient_name", "recipient_relationship"].map((name) => ({ name, value: details[name] }));

  if (details.surprise_type === 'Other') requiredFields.push({name: 'custom_surprise_type', value: details.custom_surprise_type});
  if (details.recipient_relationship === 'Other') requiredFields.push({name: 'custom_relationship', value: details.custom_relationship});
  const missingFields = requiredFields.filter((field) => !field.value);
  const hasInvalidDate = Boolean(details.surprise_date && !/^\d{4}-\d{2}-\d{2}$/.test(details.surprise_date));

  checkoutForm.querySelectorAll(".form-field").forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    field.classList.toggle(
      "is-invalid",
      Boolean(
        input &&
          (missingFields.some((missingField) => missingField.name === input.name) ||
            (input.name === "surprise_date" && hasInvalidDate))
      )
    );
  });

  return hasInvalidDate ? [...missingFields, { name: "surprise_date", value: details.surprise_date }] : missingFields;
};

const saveCheckoutDetails = (details) => {
  checkoutCustomerDetails = details;
  localStorage.setItem("surprisewalaCheckoutDetails", JSON.stringify(details));
};

function generateOrderNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `SW-${datePart}-${randomPart}`;
}

const confirmCheckoutOnWhatsapp = () => {
  if (!checkoutCustomerDetails || !cart.length) {
    return;
  }

  const details = checkoutCustomerDetails;
  const breakdown = getPaymentBreakdown();
  const selectedPackages = cart.map(getCartItemText).join(", ");
  const lines = [`Hello Surprisewala 👋`, ``, `*ORDER DETAILS*`, `Package: ${selectedPackages}`, `Package Cost: ${cartHasCustomizedPricing() ? "Custom / To Be Confirmed" : formatCurrency(breakdown.finalTotal)}`, ``, `Your Name: ${details.customer_name}`, `Contact No: ${details.customer_phone}`];
  if (details.customer_email) lines.push(`Email: ${details.customer_email}`);
  lines.push(`Surprise Date: ${details.surprise_date}`, `Time: ${details.surprise_time}`, `Surprise Location: ${details.surprise_location}`, `Surprise Type: ${details.surprise_type === "Other" ? details.custom_surprise_type : details.surprise_type}`, ``, `*SURPRISE PERSON DETAILS*`, `Name: ${details.recipient_name}`);
  if (details.recipient_phone) lines.push(`Contact No: ${details.recipient_phone}`);
  lines.push(`Relationship: ${details.recipient_relationship === "Other" ? details.custom_relationship : details.recipient_relationship}`);
  if (details.special_notes) lines.push(``, `*SPECIAL REQUIREMENTS*`, details.special_notes);
  lines.push(``, `Thank you.`);
  const message = lines.join("\n");

  saveBookingToServer({ ...details, items: cart.map((item) => ({id: item.id, quantity: item.quantity})), submission_key: checkoutSubmissionKey , payment_method: "whatsapp" }, checkoutError).catch(() => undefined);

  openSurprisewalaWhatsapp(message);
};

const addToCart = (packageId) => {
  if (!canAddPackageToCart(packageId)) {
    openDirectOrder(packageId);
    return;
  }

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

const getSelectedCakeWeight = () => Array.from(cakeWeightInputs).find((input) => input.checked)?.value || "";

const getSelectedCakeTopper = () => Array.from(cakeTopperInputs).find((input) => input.checked)?.value || "";

const renderCakeSummary = () => {
  if (!cakeSummary) {
    return;
  }

  const selectedCake = cakes[activeCakeId];
  const weight = getSelectedCakeWeight();
  const topper = getSelectedCakeTopper();
  const wording = cakeWordingInput ? cakeWordingInput.value.trim() : "";

  if (cakeSummaryMedia) {
    if (selectedCake?.image) {
      cakeSummaryMedia.classList.add("cake-summary__media--image");
      cakeSummaryMedia.removeAttribute("role");
      cakeSummaryMedia.removeAttribute("aria-label");
      cakeSummaryMedia.style.backgroundImage = "";
      cakeSummaryMedia.innerHTML = `
        <img
          src="${escapeHtml(selectedCake.image)}"
          alt="${escapeHtml(selectedCake.name)}"
          loading="lazy"
          decoding="async"
          style="display:block;width:100%;height:100%;object-fit:contain;object-position:center;"
        />
      `;
    } else {
      cakeSummaryMedia.classList.remove("cake-summary__media--image");
      cakeSummaryMedia.removeAttribute("role");
      cakeSummaryMedia.removeAttribute("aria-label");
      cakeSummaryMedia.style.backgroundImage = "";
      cakeSummaryMedia.textContent = "Cake image will be placed here";
    }
  }

  cakeSummary.innerHTML = `
    <div><dt>Selected cake</dt><dd>${escapeHtml(selectedCake?.name || "Not selected")}</dd></div>
    <div><dt>Selected weight</dt><dd>${escapeHtml(weight || "Choose weight")}</dd></div>
    <div><dt>Selected topper</dt><dd>${escapeHtml(topper || "Not selected")}</dd></div>
    <div><dt>Custom wording</dt><dd>${escapeHtml(wording || "Not provided")}</dd></div>
    <div><dt>Final price</dt><dd>${weight ? "Customized" : "Choose weight"}</dd></div>
  `;
};

const resetCakeModal = () => {
  selectedCakeWeight = "";
  selectedCakeTopper = "";
  cakeWeightInputs.forEach((input) => {
    input.checked = false;
  });
  cakeTopperInputs.forEach((input) => {
    input.checked = false;
  });
  if (cakeWordingInput) {
    cakeWordingInput.value = "";
  }
  if (cakeError) {
    cakeError.textContent = "";
  }
};

const openCakeModal = (cakeId) => {
  const selectedCake = cakes[cakeId];

  if (!selectedCake || !cakeModal || !cakeModalTitle) {
    return;
  }

  activeCakeId = cakeId;
  resetCakeModal();
  cakeModalTitle.textContent = selectedCake.name;
  renderCakeSummary();
  cakeModal.hidden = false;
  cakeModal.classList.add("is-open");
  requestAnimationFrame(() => cakeModal.classList.add("is-open"));
  document.body.classList.add("modal-open");
};

const closeCakeModal = () => {
  if (!cakeModal) {
    return;
  }

  cakeModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    if (!cakeModal.classList.contains("is-open")) {
      cakeModal.hidden = true;
    }
  }, 220);
};

const orderCakeOnWhatsapp = () => {
  const selectedCake = cakes[activeCakeId];
  const weight = getSelectedCakeWeight();
  const topper = getSelectedCakeTopper();
  const wording = cakeWordingInput ? cakeWordingInput.value.trim() : "";

  if (!selectedCake) {
    return;
  }

  if (!weight) {
    if (cakeError) {
      cakeError.textContent = "Please select a cake weight.";
    }
    return;
  }

  if (cakeError) {
    cakeError.textContent = "";
  }

  const message = `Hello Surprisewala, I would like to order this customized cake.

Cake: ${selectedCake.name}
Weight: ${weight}
Topper: ${topper || "Not selected"}
Wording: ${wording || "Not provided"}
Price: Customized`;

  closeCakeModal();
  openSurprisewalaWhatsapp(message);
};

const changeQuantity = (packageId, amount) => {
  const item = cart.find((cartItem) => cartItem.id === packageId);

  if (!item) {
    return;
  }

  item.quantity = Math.min(20, item.quantity + amount);

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

const renderModalPhoto = () => {
  if (!modalPhoto) {
    return;
  }

  if (!activeModalImages.length) {
    modalPhoto.remove();
    modalPhoto.innerHTML = "";
    modalPhoto.classList.remove("media-placeholder--image", "media-placeholder--slideshow");
    return;
  }

  const activeImage = activeModalImages[activeModalImageIndex] || activeModalImages[0];
  const hasSlideshow = activeModalImages.length > 1;

  modalPhoto.hidden = false;
  if (modalMedia && !modalPhoto.isConnected) {
    modalMedia.appendChild(modalPhoto);
  }
  modalPhoto.classList.add("media-placeholder--image");
  modalPhoto.classList.toggle("media-placeholder--slideshow", hasSlideshow);
  modalPhoto.innerHTML = `
    <img
      src="${escapeHtml(activeImage.src)}"
      alt="${escapeHtml(activeImage.alt)}"
      loading="lazy"
      decoding="async"
    />
    ${
      hasSlideshow
        ? `
          <button class="package-slideshow__arrow package-slideshow__arrow--prev" type="button" data-package-slide="prev" aria-label="Previous package image"></button>
          <button class="package-slideshow__arrow package-slideshow__arrow--next" type="button" data-package-slide="next" aria-label="Next package image"></button>
          <div class="package-slideshow__dots" aria-label="Package image slideshow controls">
            ${activeModalImages
              .map(
                (_, index) => `
                  <button
                    class="package-slideshow__dot${index === activeModalImageIndex ? " is-active" : ""}"
                    type="button"
                    data-package-slide-index="${index}"
                    aria-label="Show package image ${index + 1}"
                  ></button>
                `
              )
              .join("")}
          </div>
        `
        : ""
    }
  `;
};

const goToModalImage = (nextIndex) => {
  if (!activeModalImages.length) {
    return;
  }

  activeModalImageIndex = (nextIndex + activeModalImages.length) % activeModalImages.length;
  renderModalPhoto();
};

const renderModalVideo = (selectedPackage) => {
  if (!modalVideo) {
    return;
  }

  const packageVideo = selectedPackage?.video;
  modalVideo.classList.toggle("media-placeholder--video-ready", Boolean(packageVideo));
  modalVideo.classList.toggle("media-placeholder--portrait-video", packageVideo?.orientation === "portrait");

  if (!packageVideo) {
    modalVideo.innerHTML = `
      <span class="media-placeholder__play" aria-hidden="true"></span>
      <span>Video will be placed here</span>
    `;
    return;
  }

  modalVideo.innerHTML = `
    <video controls playsinline preload="metadata" aria-label="${escapeHtml(packageVideo.label || selectedPackage.name)}">
      <source src="${escapeHtml(packageVideo.src)}" type="video/mp4" />
    </video>
  `;
};

const openDetails = (packageId) => {
  const selectedPackage = packages[packageId];

  if (!selectedPackage || !detailsModal || !modalTitle || !modalDescription || !modalPrice || !modalIncludes || !modalCartButton) {
    return;
  }

  activePackageId = packageId;
  modalTitle.textContent = selectedPackage.name;
  if (modalBadge) {
    modalBadge.textContent = selectedPackage.badge || "";
    modalBadge.hidden = !selectedPackage.badge;
  }
  modalDescription.textContent = selectedPackage.description;
  modalPrice.textContent = selectedPackage.priceLabel;
  if (modalNote) {
    modalNote.textContent = selectedPackage.note || "";
    modalNote.hidden = !selectedPackage.note;
  }
  modalCartButton.textContent = canAddPackageToCart(packageId) ? "Add to Cart" : "Book Now";
  modalIncludes.innerHTML = selectedPackage.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  activeModalImages = selectedPackage.images?.length ? selectedPackage.images : (selectedPackage.image ? [selectedPackage.image] : []);
  activeModalImageIndex = 0;
  renderModalPhoto();
  renderModalVideo(selectedPackage);
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

const renderDirectOrderSummary = () => {
  if (!directOrderSummary || !activeDirectOrderPackageId) {
    return;
  }

  const selectedPackage = packages[activeDirectOrderPackageId];

  if (directPackageCost) directPackageCost.value = selectedPackage?.priceLabel || "Custom / To Be Confirmed";

  if (!selectedPackage) {
    directOrderSummary.innerHTML = "";
    return;
  }

  directOrderSummary.innerHTML = `
    <article class="checkout-summary__item direct-order-summary__item">
      <div class="checkout-summary__content">
        <h4>${escapeHtml(selectedPackage.name)}</h4>
        <p>${escapeHtml(selectedPackage.description || "")}</p>
      </div>
      <strong>${escapeHtml(selectedPackage.priceLabel)}</strong>
    </article>
  `;
};

const openDirectOrder = (packageId) => {
  const selectedPackage = packages[packageId];

  if (!selectedPackage || !directOrderModal || !directOrderForm) {
    return;
  }

  activeDirectOrderPackageId = packageId;
  directSubmissionKey = crypto.randomUUID();
  directOrderForm.reset();

  if (directOrderError) {
    directOrderError.textContent = "";
  }

  directOrderForm.querySelectorAll(".form-field").forEach((field) => field.classList.remove("is-invalid"));
  renderDirectOrderSummary();
  directOrderModal.hidden = false;
  requestAnimationFrame(() => directOrderModal.classList.add("is-open"));
  document.body.classList.add("modal-open");
};

const closeDirectOrder = () => {
  if (!directOrderModal) {
    return;
  }

  directOrderModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    if (!directOrderModal.classList.contains("is-open")) {
      directOrderModal.hidden = true;
    }
  }, 240);
};

const getDirectOrderDetails = () => {
  if (!directOrderForm) {
    return null;
  }

  const formData = new FormData(directOrderForm);

  return { customer_name: String(formData.get("customer_name") || "").trim(), customer_phone: String(formData.get("customer_phone") || "").trim(), customer_email: String(formData.get("customer_email") || "").trim(), surprise_date: String(formData.get("surprise_date") || "").trim(), surprise_location: String(formData.get("surprise_location") || "").trim(), surprise_time: String(formData.get("surprise_time") || "").trim(), surprise_type: String(formData.get("surprise_type") || "").trim(), custom_surprise_type: String(formData.get("custom_surprise_type") || "").trim(), recipient_name: String(formData.get("recipient_name") || "").trim(), recipient_phone: String(formData.get("recipient_phone") || "").trim(), recipient_relationship: String(formData.get("recipient_relationship") || "").trim(), custom_relationship: String(formData.get("custom_relationship") || "").trim(), special_notes: String(formData.get("special_notes") || "").trim() };
};

const validateDirectOrderDetails = (details) => {
  const requiredFields = ["customer_name", "customer_phone", "surprise_date", "surprise_location", "surprise_time", "surprise_type", "recipient_name", "recipient_relationship"].map((name) => ({ name, value: details[name] }));
  if (details.surprise_type === 'Other') requiredFields.push({name: 'custom_surprise_type', value: details.custom_surprise_type});
  if (details.recipient_relationship === 'Other') requiredFields.push({name: 'custom_relationship', value: details.custom_relationship});
  const missingFields = requiredFields.filter((field) => !field.value);
  const hasInvalidDate = Boolean(details.surprise_date && !/^\d{4}-\d{2}-\d{2}$/.test(details.surprise_date));

  directOrderForm.querySelectorAll(".form-field").forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    field.classList.toggle(
      "is-invalid",
      Boolean(
        input &&
          (missingFields.some((missingField) => missingField.name === input.name) ||
            (input.name === "surprise_date" && hasInvalidDate))
      )
    );
  });

  return hasInvalidDate ? [...missingFields, { name: "surprise_date", value: details.surprise_date }] : missingFields;
};

const submitDirectOrderToWhatsapp = (details) => {
  const selectedPackage = packages[activeDirectOrderPackageId];

  if (!selectedPackage) {
    return;
  }

  const lines = [`Hello Surprisewala 👋`, ``, `*ORDER DETAILS*`, `Package: ${selectedPackage.name}`, `Package Cost: ${selectedPackage.priceLabel}`, ``, `Your Name: ${details.customer_name}`, `Contact No: ${details.customer_phone}`];
  if (details.customer_email) lines.push(`Email: ${details.customer_email}`);
  lines.push(`Surprise Date: ${details.surprise_date}`, `Time: ${details.surprise_time}`, `Surprise Location: ${details.surprise_location}`, `Surprise Type: ${details.surprise_type === "Other" ? details.custom_surprise_type : details.surprise_type}`, ``, `*SURPRISE PERSON DETAILS*`, `Name: ${details.recipient_name}`);
  if (details.recipient_phone) lines.push(`Contact No: ${details.recipient_phone}`);
  lines.push(`Relationship: ${details.recipient_relationship === "Other" ? details.custom_relationship : details.recipient_relationship}`);
  if (details.special_notes) lines.push(``, `*SPECIAL REQUIREMENTS*`, details.special_notes);
  lines.push(``, `Thank you.`);
  const message = lines.join("\n");
  saveBookingToServer({ ...details, items: [{id: activeDirectOrderPackageId, quantity: 1}], submission_key: directSubmissionKey , payment_method: "whatsapp" }, directOrderError).catch(() => undefined);

  openSurprisewalaWhatsapp(message);
};

const saveBookingToServer = async (details, errorElement) => {
  if (bookingSaveInFlight) return;
  bookingSaveInFlight = true;
  try {
    const response = await fetch('/api/orders', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) });
    const result = await response.json();
    if (!response.ok || (storefrontData.source === 'managed' && !result.saved)) throw new Error(result.error || "Your booking could not be saved. Please keep this form open and retry, or confirm directly on WhatsApp.");
    if (errorElement) errorElement.textContent = result.saved ? 'Booking saved. Our team will confirm availability with you on WhatsApp.' : 'Continue with our team on WhatsApp to confirm your booking.';
    return result;
  } catch (error) {
    if (errorElement) errorElement.textContent = error.message || 'Unable to save this booking. Please retry or contact us on WhatsApp.';
    throw error;
  } finally { bookingSaveInFlight = false; }
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
  const orderButton = event.target.closest("[data-order-package]");
  const cakeButton = event.target.closest("[data-customize-cake]");
  const decreaseButton = event.target.closest("[data-decrease-cart]");
  const increaseButton = event.target.closest("[data-increase-cart]");
  const removeButton = event.target.closest("[data-remove-cart]");

  if (viewButton) {
    openDetails(viewButton.dataset.viewPackage);
  }

  if (addButton) {
    const packageId = addButton.dataset.addPackage;

    if (canAddPackageToCart(packageId)) {
      addToCart(packageId);
      openCart();
    } else {
      openDirectOrder(packageId);
    }
  }

  if (orderButton) {
    openDirectOrder(orderButton.dataset.orderPackage);
  }

  if (cakeButton) {
    openCakeModal(cakeButton.dataset.customizeCake);
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

    if (!canAddPackageToCart(activePackageId)) {
      const packageId = activePackageId;
      closeDetails();
      openDirectOrder(packageId);
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

if (modalPhoto) {
  modalPhoto.addEventListener("click", (event) => {
    const slideButton = event.target.closest("[data-package-slide]");
    const slideDot = event.target.closest("[data-package-slide-index]");

    if (slideButton) {
      goToModalImage(activeModalImageIndex + (slideButton.dataset.packageSlide === "next" ? 1 : -1));
      return;
    }

    if (slideDot) {
      goToModalImage(Number(slideDot.dataset.packageSlideIndex));
    }
  });
}

if (cakeModal) {
  cakeModal.addEventListener("click", (event) => {
    if (event.target === cakeModal) {
      closeCakeModal();
    }
  });
}

document.querySelectorAll("[data-close-cake]").forEach((button) => {
  button.addEventListener("click", closeCakeModal);
});

cakeWeightInputs.forEach((input) => {
  input.addEventListener("change", renderCakeSummary);
});

cakeTopperInputs.forEach((input) => {
  input.addEventListener("change", renderCakeSummary);
});

if (cakeWordingInput) {
  cakeWordingInput.addEventListener("input", renderCakeSummary);
}

if (cakeCheckoutButton) {
  cakeCheckoutButton.addEventListener("click", orderCakeOnWhatsapp);
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

if (checkoutOpenButton) {
  checkoutOpenButton.addEventListener("click", openCheckout);
}

if (checkoutCloseButton) {
  checkoutCloseButton.addEventListener("click", closeCheckout);
}

if (checkoutModal) {
  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) {
      closeCheckout();
    }
  });
}

if (directOrderCloseButton) {
  directOrderCloseButton.addEventListener("click", closeDirectOrder);
}

if (directOrderModal) {
  directOrderModal.addEventListener("click", (event) => {
    if (event.target === directOrderModal) {
      closeDirectOrder();
    }
  });
}

if (checkoutDateInput) {
  checkoutDateInput.addEventListener("input", () => {
    checkoutDateInput.value = formatCheckoutDateTyping(checkoutDateInput.value);
  });

  checkoutDateInput.addEventListener("blur", () => {
    checkoutDateInput.value = formatCheckoutDate(checkoutDateInput.value);
  });
}

if (directOrderDateInput) {
  directOrderDateInput.addEventListener("input", () => {
    directOrderDateInput.value = formatCheckoutDateTyping(directOrderDateInput.value);
  });

  directOrderDateInput.addEventListener("blur", () => {
    directOrderDateInput.value = formatCheckoutDate(directOrderDateInput.value);
  });
}

if (customDateInput) {
  customDateInput.addEventListener("input", () => {
    customDateInput.value = formatCheckoutDateTyping(customDateInput.value);
  });

  customDateInput.addEventListener("blur", () => {
    customDateInput.value = formatCheckoutDate(customDateInput.value);
  });
}

if (directOrderForm) {
  directOrderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const details = getDirectOrderDetails();

    if (!details) {
      return;
    }

    const missingFields = validateDirectOrderDetails(details);

    if (missingFields.length) {
      if (directOrderError) {
        directOrderError.textContent =
          details.surprise_date && !/^\d{4}-\d{2}-\d{2}$/.test(details.surprise_date)
            ? "Please choose a valid surprise date."
            : "Please complete the required fields.";
      }
      return;
    }

    if (directOrderError) {
      directOrderError.textContent = "";
    }

    const submitButton = directOrderForm.querySelector("button[type=submit]");
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Preparing WhatsApp…"; }
    submitDirectOrderToWhatsapp(details);
    window.setTimeout(() => { if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Send on WhatsApp"; } }, 1200);
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!cart.length) {
      if (checkoutError) {
        checkoutError.textContent = "Your cart is empty.";
      }
      return;
    }

    const details = getCheckoutDetails();

    if (!details) {
      return;
    }

    const missingFields = validateCheckoutDetails(details);

    if (missingFields.length) {
      if (checkoutError) {
        checkoutError.textContent =
          details.surprise_date && !/^\d{4}-\d{2}-\d{2}$/.test(details.surprise_date)
            ? "Please choose a valid surprise date."
            : "Please complete the required fields.";
      }
      return;
    }

    if (checkoutError) {
      checkoutError.textContent = "";
    }

    saveCheckoutDetails(details);
    renderCheckoutSummaries();
    showCheckoutStep("payment");
  });
}

paymentMethodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPaymentMethod = button.dataset.paymentMethod || "card";
    localStorage.setItem("surprisewalaPaymentMethod", selectedPaymentMethod);
    renderPaymentDetails();
  });
});

installmentMethodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedInstallmentMethod = button.dataset.installmentMethod || "koko";
    localStorage.setItem("surprisewalaInstallmentMethod", selectedInstallmentMethod);
    renderPaymentDetails();
  });
});

if (copyAccountButton && bankAccountNumber) {
  copyAccountButton.addEventListener("click", async () => {
    const accountNumber = bankAccountNumber.textContent.trim();

    try {
      await navigator.clipboard.writeText(accountNumber);
      copyAccountButton.textContent = "Copied";
      window.setTimeout(() => {
        copyAccountButton.textContent = "Copy Account Number";
      }, 1600);
    } catch {
      copyAccountButton.textContent = accountNumber;
    }
  });
}

if (confirmWhatsappButton) {
  confirmWhatsappButton.addEventListener("click", confirmCheckoutOnWhatsapp);
}

if (backToCartButton) {
  backToCartButton.addEventListener("click", () => {
    closeCheckout();
    window.setTimeout(openCart, 220);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeDetails();
  closeCakeModal();
  closeDirectOrder();
  closeCart();
  closeCheckout();
});

loadCart();
selectedPaymentMethod = "bank";
selectedInstallmentMethod = localStorage.getItem("surprisewalaInstallmentMethod") || "koko";
syncPackageActionButtons();
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
    const formattedDate = formatDisplayDate(date);
    const time = String(formData.get("time") || "").trim();
    const formattedTime = formatDisplayTime(time);
    const location = String(formData.get("location") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const customMessage = String(formData.get("customMessage") || "").trim();
    const requiredFields = [
      { name: "name", value: name, label: "Name" },
      { name: "phone", value: phone, label: "Phone" },
      { name: "occasion", value: occasion, label: "Occasion" },
    ];
    const missingFields = requiredFields.filter((field) => !field.value);
    const hasInvalidDate = Boolean(date && !parseCheckoutDate(date));

    customForm.querySelectorAll(".form-field").forEach((field) => {
      const input = field.querySelector("input, select, textarea");
      field.classList.toggle(
        "is-invalid",
        Boolean(
          input &&
            (missingFields.some((missingField) => missingField.name === input.name) ||
              (input.name === "date" && hasInvalidDate))
        )
      );
    });

    if (missingFields.length || hasInvalidDate) {
      if (customFormError) {
        customFormError.textContent = hasInvalidDate
          ? "Please enter the preferred date as DD/MM/YYYY."
          : `Please fill: ${missingFields.map((field) => field.label).join(", ")}.`;
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
Date: ${formattedDate || "Not provided"}
Time: ${formattedTime || "Not provided"}
Location: ${location}
Budget: ${budget}

My Idea:
${customMessage}

Please send me more details.`;

    if (whatsappSubmitButton) {
      whatsappSubmitButton.classList.add("is-loading");
      whatsappSubmitButton.textContent = "Opening WhatsApp...";
    }

    window.setTimeout(() => {
      openSurprisewalaWhatsapp(message);

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
          <span class="country-option__flag">
            <img src="${country.flag}" alt="${country.name} flag" loading="lazy" decoding="async" />
          </span>
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

if (navbarCountryClose) {
  navbarCountryClose.addEventListener("click", (event) => {
    event.stopPropagation();
    closeNavbarCountryMenu();
  });
}

if (navbarCountryMenu) {
  navbarCountryMenu.addEventListener("click", (event) => {
    if (event.target === navbarCountryMenu && window.matchMedia("(max-width: 768px)").matches) {
      closeNavbarCountryMenu();
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
    closeNavbarCountryMenu();
    openSurprisewalaWhatsapp(message);
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
  const url = new URL(href, window.location.href);
  const hash = url.hash || (href === "#" ? "#" : "");

  if (href === "#" || (!hash && url.pathname === window.location.pathname)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const targetSelector = packageCategoryHashMap[hash] ? "#packages" : hash || "#";
  const target = targetSelector === "#" ? null : document.querySelector(targetSelector);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (hash) {
      window.history.pushState(null, "", `${window.location.pathname}${hash}`);
    }
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
    const packageFilter = link.dataset.menuPackageFilter;

    const url = new URL(href, window.location.href);

    if (url.origin === window.location.origin && (href.startsWith("#") || href.startsWith("/#") || href === "/")) {
      event.preventDefault();
      closePremiumMenu();
      window.setTimeout(() => {
        if (packageFilter) {
          activatePackageFilter(packageFilter);
        }

        scrollToMenuTarget(href);
      }, 240);
    }
  });
});

const openCakeFromHash = () => {
  const cakeId = window.location.hash.replace("#", "");

  if (!cakeId || !cakes[cakeId]) {
    return;
  }

  activatePackageFilter("cakes");
  packagesSection?.scrollIntoView({ behavior: "auto", block: "start" });
  openCakeModal(cakeId);
};

const openPackageCategoryFromHash = () => {
  const filter = window.location.hash === "#packages" && storefrontData.initial_collection !== "all" ? storefrontData.initial_collection : packageCategoryHashMap[window.location.hash];

  if (!filter) {
    return;
  }

  activatePackageFilter(filter);
  packagesSection?.scrollIntoView({ behavior: "auto", block: "start" });
};

window.addEventListener("load", openCakeFromHash);
window.addEventListener("load", openPackageCategoryFromHash);
window.addEventListener("hashchange", openPackageCategoryFromHash);
openCakeFromHash();
openPackageCategoryFromHash();

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

})();

// Online payment is an opt-in extension. Existing guest WhatsApp flow is unchanged.
const payhereCard = document.querySelector('[data-payhere-method]');
if (payhereCard) fetch('/api/payhere/availability').then(r=>r.json()).then(data=>{payhereCard.hidden=!data.enabled;}).catch(()=>{});
const payhereBook = document.querySelector('[data-payhere-book]');
if (payhereBook) payhereBook.addEventListener('click',async()=>{
 const error=document.querySelector('[data-payhere-error]');
 payhereBook.disabled=true;
 try {
  if(!checkoutCustomerDetails || !cart.length) throw new Error('Complete your booking details first.');
  if(cartHasCustomizedPricing()) throw new Error('Contact our team to confirm your custom quote before payment.');
  const me=await fetch('/api/me',{cache:'no-store'});
  const account=await me.json();
  if(!account.authenticated) throw new Error('Please sign in before online payment. Your cart will stay saved. Guest WhatsApp ordering remains available.');
  const result=await saveBookingToServer({...checkoutCustomerDetails,items:cart.map(item=>({id:item.id,quantity:item.quantity})),submission_key:checkoutSubmissionKey,payment_method:'card'},error);
  if(!result?.saved || !result.orderId) throw new Error('A saved booking is required. Please retry or contact support.');
  location.assign('/payment/checkout?order='+encodeURIComponent(result.orderId));
 }catch(e){error.textContent=e.message||'Unable to prepare payment.';payhereBook.disabled=false;}
});
