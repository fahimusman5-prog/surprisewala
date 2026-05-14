const statCards = document.querySelectorAll(".stat-card");
const statNumbers = document.querySelectorAll("[data-count-to]");
const storySection = document.querySelector(".our-story");
const readMoreButton = document.querySelector(".read-more");
const packageCards = document.querySelectorAll("[data-package-card]");
const packageFilterButtons = document.querySelectorAll("[data-package-filter]");
const packageEmptyMessage = document.querySelector("[data-package-empty]");
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
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const cartCloseButton = document.querySelector("[data-close-cart]");
const cartItemsContainer = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const checkoutOpenButton = document.querySelector("[data-open-checkout]");
const checkoutModal = document.querySelector("[data-checkout-modal]");
const checkoutCloseButton = document.querySelector("[data-close-checkout]");
const checkoutDetailsStep = document.querySelector("[data-checkout-details]");
const checkoutPaymentStep = document.querySelector("[data-checkout-payment]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const checkoutDateInput = document.querySelector("#preferredDate");
const checkoutError = document.querySelector("[data-checkout-error]");
const checkoutSummary = document.querySelector("[data-checkout-summary]");
const checkoutTotal = document.querySelector("[data-checkout-total]");
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
const menuPackageFilterLinks = document.querySelectorAll("[data-menu-package-filter]");
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
    name: "Simple but elegant Surprise",
    badge: "Midnight / Day / Night",
    price: 14000,
    priceLabel: "LKR 14,000",
    note: "Including transportation charges within Colombo 1-15",
    description: "A heartfelt cake, bouquet or frame surprise with full memory coverage.",
    image: {
      src: "assets/birthday-cake-14k.jpeg",
      alt: "Birthday cake and flower bouquet for Simple but elegant Surprise package",
    },
    includes: [
      "1 kg Customized Cake or Double Chocolate fudge Cake (wording can be customized)",
      "Natural Flower Bouquet Or Customized Frame",
      "Full Coverage of video with pictures (free of charge)",
      "Final Surprise video (free of charge)",
      "Complementary Polaroid picture to keep it as a long time memory (an on point printed photo will be given at that moment)",
    ],
  },
  "on-the-go": {
    name: "Unexpected surprise on the go",
    badge: "Midnight / Day / Night",
    price: 18000,
    priceLabel: "LKR 18,000",
    note: "Including transportation charges within Colombo 1-15",
    description: "A moving surprise with cake, flowers, firework, video and keepsakes.",
    images: [
      {
        src: "assets/on-the-go-18k-fireworks.jpeg",
        alt: "Firework surprise moment for Unexpected surprise on the go package",
      },
      {
        src: "assets/on-the-go-18k-cake.jpeg",
        alt: "Cake and bouquet for Unexpected surprise on the go package",
      },
    ],
    includes: [
      "1 kg Customized Cake or Double Chocolate fudge Cake (wording can be customized)",
      "Natural Flower Bouquet Or Customized Frame",
      "Firework (12 shot or one Shot Sky cell)",
      "Full Coverage of video with pictures (free of charge)",
      "Final Surprise video (free of charge)",
      "Complementary Polaroid picture to keep it as a long time memory (an on point printed photo will be given at that moment)",
    ],
  },
  lightup: {
    name: "Lightup surprise",
    price: 21000,
    priceLabel: "LKR 21,000",
    description: "A glowing transparent box setup with roses, chocolates and balloons.",
    includes: [
      "1 kg Customized Cake or Double Chocolate fudge Cake",
      "Customized Transparent Box with fairy lights",
      "Natural Red Rose",
      "Cadbury Chocolate",
      "Bunch of Helium balloons (Theme Red - 1 Red Heart Foil And 2 red balloons)",
      "Full Coverage of video with pictures",
      "Final Surprise video with a Cinematic Song (free of charge)",
      "Complementary Polaroid picture from us as a Gesture",
    ],
  },
  flashmob: {
    name: "A flashmob surprise to your loved ones",
    badge: "Midnight / Day / Night",
    price: 26000,
    priceLabel: "LKR 26,000",
    note: "Including transportation charges within Colombo 1-15",
    description: "A bold balloon, cake, flower and firework moment with full coverage.",
    images: [
      {
        src: "assets/flashmob-26k-balloon-cake.jpeg",
        alt: "Balloon setup with cake and bouquet for flashmob surprise package",
      },
      {
        src: "assets/flashmob-26k-fireworks.jpeg",
        alt: "Firework moment for flashmob surprise package",
      },
    ],
    includes: [
      "Balloon Setup (Can be customized the color and wording)",
      "1 kg Customized Cake or Double Chocolate fudge Cake (wording can be customized)",
      "Natural Flower Bouquet Or Customized Frame",
      "Firework (12 shots / One Shot Sky Cell)",
      "Full Coverage of video with pictures (free of charge)",
      "Final Surprise video (free of charge)",
      "Complementary Polaroid picture to keep it as a long time memory (an on point printed photo will be given at that moment)",
    ],
  },
  emotions: {
    name: "Those emotions what we live for!",
    badge: "Midnight / Day / Night",
    price: 28000,
    priceLabel: "LKR 28,000",
    note: "Including transportation charges within Colombo 1-15",
    description: "A cinematic emotional surprise with balloons, cake, flowers and sky rockets.",
    images: [
      {
        src: "assets/emotions-28k-balloon-cake.jpeg",
        alt: "Balloon setup with cake and bouquet for Those emotions package",
      },
      {
        src: "assets/emotions-28k-fireworks.jpeg",
        alt: "Firework moment for Those emotions package",
      },
    ],
    includes: [
      "Balloon Setup (Can be customized the color and wording)",
      "1 kg Customized Cake or Double Chocolate fudge Cake (wording can be customized)",
      "Natural Flower Bouquet Or Customized Frame",
      "Fireworks (100 Sky Rockets)",
      "Full Coverage of surprise videos with pictures (free of charge)",
      "Final Surprise video with cinematic song (free of charge)",
      "Complementary Polaroid picture to keep it as a long time memory (an on point printed photo will be given at that moment)",
    ],
  },
  "unique-wow": {
    name: "Unique way to surprise your loved to feel wow",
    badge: "Midnight / Day / Night",
    price: 36000,
    priceLabel: "LKR 36,000",
    note: "Including transportation charges within Colombo 1-15",
    description: "A unique banner surprise with decor, bouquet, cake and fireworks.",
    images: [
      {
        src: "assets/unique-wow-36k-balloon-cake.jpeg",
        alt: "Balloon setup with cake and bouquet for Unique way surprise package",
      },
      {
        src: "assets/unique-wow-36k-fireworks.jpeg",
        alt: "Firework moment for Unique way surprise package",
      },
    ],
    includes: [
      "Balloon Setup (Can be customized the color and wording)",
      "1 kg Customized Cake or Double Chocolate fudge Cake",
      "Banner Surprise (Can be planned in a unique way)",
      "Natural Flower Bouquet",
      "Fireworks (100 Sky Rockets)",
      "Full Coverage of surprise videos with pictures (free of charge)",
      "Final Surprise video with cinematic song (free of charge)",
      "Complementary Polaroid picture to keep it as a long time memory (an on point printed photo will be given at that moment)",
    ],
  },
  "car-surprise": {
    name: "Car Surprise",
    price: 37000,
    priceLabel: "LKR 37,000",
    description: "A decorated car surprise with lights, balloons, cake, bouquet and fireworks.",
    includes: [
      "Including Car",
      "Light Theme setup",
      "Full Decorations with balloons, Banner and Photos",
      "Mini cake with Customized Wording",
      "Natural Flower Bouquet",
      "Fireworks (12 shots)",
      "Balloon setup (can be customized the theme and wording)",
      "Full Coverage and Surprise video with pictures",
      "Complementary Polaroid picture from us as a Gesture",
    ],
  },
  "cafe-surprise": {
    name: "Cafe Surprise",
    price: 36000,
    priceLabel: "LKR 36,000",
    description: "A romantic cafe setup with cake, music, petals, bouquet and decor.",
    includes: [
      "Customized decor with a Mini chocolate fudge cake with customized wording",
      "Background music",
      "Natural Flower Bouquet to propose your loved ones",
      "Romantic setup with Petals",
      "Balloon Setup",
      "Complementary Polaroid picture from us as a Gesture",
      "Including Place hiring cost",
      "Flower Fountain cracker",
      "Surprise video with pictures",
    ],
  },
  "beach-surprise": {
    name: "Beach Surprise",
    price: 38000,
    priceLabel: "LKR 38,000",
    description: "A beachside letter-light setup with petals, candles, cake and fireworks.",
    includes: [
      "Simple Deco with letter lights (can be customized according to your idea)",
      "Full of rose petals and candles",
      "Mini cake (Can be Customized the wording)",
      "Natural Rose or Normal Bouquet",
      "Fireworks (100 Shots and fountains)",
      "Complementary Polaroid picture from us as a Gesture",
      "Full Coverage of video with pictures",
      "Final Surprise video (free of charge)",
    ],
  },
  "romantic-room": {
    name: "Romantic Room Setup",
    price: 36000,
    priceLabel: "LKR 36,000",
    description: "A private room setup with rose petals, candles, balloons, cake and bouquet.",
    includes: [
      "Full deco (can be customized according to your idea)",
      "Full of rose petals and candles",
      "Mini cake",
      "Few Helium Gas balloons with pictures",
      "Balloon setup (can be customized the theme and wording)",
      "Natural Rose or Normal Bouquet",
      "Complementary Polaroid picture from us as a Gesture",
      "Full Coverage of video with pictures",
      "Final Surprise video (free of charge)",
    ],
  },
  boat: {
    name: "Private Solo Boat Surprise",
    price: 87000,
    priceLabel: "LKR 87,000",
    description: "A private boat experience with decor, cake, guitarist, fireworks and sailing.",
    includes: [
      "Romantic Decorations inside the Boat",
      "Mini chocolate fudge cake with customized wording",
      "Guitarist with selected songs to express the love with music (3 to 5 songs can be chosen)",
      "Flower Bouquet to Propose or give your loved ones",
      "Full Firework Show",
      "Venue charge included",
      "30 Mins Boat sailing in the lake",
      "Very Beautiful location to take pictures",
      "Full surprise videos and Pictures will be given",
    ],
  },
  "live-music": {
    name: "Live Music surprise to your loved ones under the moon!",
    price: 48000,
    priceLabel: "LKR 48,000",
    description: "A moonlit live music surprise with cake, balloons, bouquet and fireworks.",
    includes: [
      "Live Music with the guitar (4 songs can be chosen and we make it as a remix and Ending with Happy Birthday Song)",
      "Chocolate Fudge cake/ Any other cake within the budget (wording can be customized)",
      "Balloon setup (can be customized the theme and wording)",
      "Natural Rose Bouquet",
      "Firework Show",
      "Complementary Polaroid picture from us as a Gesture",
      "Full Coverage of video with pictures",
      "Final Surprise video (free of charge)",
    ],
  },
  "theater-surprise": {
    name: "Theater Surprise",
    price: 103000,
    priceLabel: "LKR 103,000",
    description: "A luxury theater surprise with edited video, movie experience and bouquet.",
    includes: [
      "A small video clip will be played on the theater screen (Video will Edited from our End)",
      "Lux theater experience with a movie including 45 seats (Movie can be Selected according your wish which is available on the requested day)",
      "Cake Hamper Set will be brought inside the theater or Small backdrop with a cake in a lobby Area",
      "Rose Bouquet",
      "Complementary Polaroid picture from us as a Gesture",
      "Full Surprise video coverage with pictures will be provided",
    ],
  },
  "teepee-surprise": {
    name: "Teepee Surprise",
    price: 53000,
    priceLabel: "LKR 53,000",
    note: "Including hiring and transportation cost",
    description: "A cozy teepee setup with cake, bouquet, flower fountain and coverage.",
    includes: [
      "Teepee Setup (can be customized according to your idea)",
      "Double chocolate fudge cake or any simple customized cake",
      "Natural Rose Bouquet",
      "Flower Fountain",
      "Complementary Polaroid picture from us as a Gesture",
      "Including hiring and transportation cost",
      "Full Coverage of video with pictures",
      "Final Surprise video (free of charge)",
    ],
  },
  "marry-me": {
    name: "Marry Me Surprise",
    price: 132000,
    priceLabel: "LKR 132,000",
    description: "A full proposal setup with crackers, roses, music, coverage and emotion.",
    includes: [
      "Romantic Full Setup",
      "Cracker Show",
      "Rose Bouquet to knee Down and Propose",
      "Full coverage videos and Pictures",
      "Random People Giving roses",
      "Background Music while proposing",
    ],
  },
};

let cart = [];
let activePackageId = null;
let checkoutCustomerDetails = null;
let selectedPaymentMethod = "card";
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
  { name: "Sri Lanka", flag: "https://flagcdn.com/w80/lk.png", whatsapp: "94760505866" },
  { name: "United Arab Emirates", flag: "https://flagcdn.com/w80/ae.png", whatsapp: "94760505866" },
  { name: "Qatar", flag: "https://flagcdn.com/w80/qa.png", whatsapp: "94760505866" },
  { name: "Saudi Arabia", flag: "https://flagcdn.com/w80/sa.png", whatsapp: "94760505866" },
  { name: "Kuwait", flag: "https://flagcdn.com/w80/kw.png", whatsapp: "94760505866" },
  { name: "Oman", flag: "https://flagcdn.com/w80/om.png", whatsapp: "94760505866" },
  { name: "Japan", flag: "https://flagcdn.com/w80/jp.png", whatsapp: "94760505866" },
  { name: "Australia", flag: "https://flagcdn.com/w80/au.png", whatsapp: "94760505866" },
  { name: "United Kingdom", flag: "https://flagcdn.com/w80/gb.png", whatsapp: "94760505866" },
];

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

activatePackageFilter("all");

packageFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.packageFilter || "all";

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

  if (checkoutModal && !checkoutModal.hidden) {
    renderCheckoutSummaries();
  }
};

const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

const getPaymentBreakdown = () => {
  const methodKey = selectedPaymentMethod === "installment" ? selectedInstallmentMethod : selectedPaymentMethod;
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
      <div><span>Original Total</span><strong>${formatCurrency(breakdown.originalTotal)}</strong></div>
      <div><span>${breakdown.method.feeLabel}</span><strong>${formatCurrency(breakdown.feeAmount)}</strong></div>
      <div class="payment-breakdown__final"><span>Final Payable Total</span><strong>${formatCurrency(breakdown.finalTotal)}</strong></div>
    `;
  }

  if (bankDetails) {
    bankDetails.hidden = selectedPaymentMethod !== "bank";
  }

  if (confirmWhatsappButton) {
    confirmWhatsappButton.textContent = breakdown.method.actionLabel;
  }

  if (paymentTotal) {
    paymentTotal.textContent = formatCurrency(breakdown.finalTotal);
  }
};

const getCartItemsText = () =>
  cart
    .map((item) => `- ${item.name} x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
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
          <div>
            <h4>${item.name}</h4>
            <p>Qty ${item.quantity} x ${formatCurrency(item.price)}</p>
          </div>
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
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
  const dateTime = [formatDisplayDate(details.date), formatDisplayTime(details.time)].filter(Boolean).join(" ");

  customerSummary.innerHTML = `
    <dl>
      <div><dt>Name</dt><dd>${details.fullName}</dd></div>
      <div><dt>Phone</dt><dd>${details.phone}</dd></div>
      ${details.email ? `<div><dt>Email</dt><dd>${details.email}</dd></div>` : ""}
      <div><dt>Country</dt><dd>Not provided</dd></div>
      <div><dt>Occasion</dt><dd>${details.occasion}</dd></div>
      <div><dt>Date & Time</dt><dd>${dateTime || formatDisplayDate(details.date)}</dd></div>
      ${details.location ? `<div><dt>Location</dt><dd>${details.location}</dd></div>` : ""}
      ${details.notes ? `<div><dt>Notes</dt><dd>${details.notes}</dd></div>` : ""}
    </dl>
  `;
};

const renderCheckoutSummaries = () => {
  renderSummaryItems(checkoutSummary);
  renderSummaryItems(paymentSummary);

  const total = formatCurrency(getCartTotal());

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

  closeCart();
  renderCheckoutSummaries();
  showCheckoutStep("details");
  checkoutModal.hidden = false;
  requestAnimationFrame(() => checkoutModal.classList.add("is-open"));
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

  return {
    fullName: String(formData.get("fullName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    occasion: String(formData.get("occasion") || "").trim(),
    date: formatCheckoutDate(formData.get("date")),
    time: String(formData.get("time") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
};

const validateCheckoutDetails = (details) => {
  const requiredFields = [
    { name: "fullName", value: details.fullName },
    { name: "phone", value: details.phone },
    { name: "occasion", value: details.occasion },
    { name: "date", value: details.date },
  ];
  const missingFields = requiredFields.filter((field) => !field.value);
  const hasInvalidDate = Boolean(details.date && !parseCheckoutDate(details.date));

  checkoutForm.querySelectorAll(".form-field").forEach((field) => {
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

  return hasInvalidDate ? [...missingFields, { name: "date", value: details.date }] : missingFields;
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
  const selectedPackages = cart.map((item) => `${item.name} x ${item.quantity}`).join(", ");
  const message = `Hello Surprisewala, I would like to confirm my order.

Customer Details:
Name: ${details.fullName}
Phone: ${details.phone}
Country: Not provided
Occasion: ${details.occasion}
Date: ${formatDisplayDate(details.date)}
Time: ${formatDisplayTime(details.time) || "Not provided"}
Location: ${details.location || "Not provided"}

Order Details:
Package: ${selectedPackages}
Total: ${formatCurrency(breakdown.finalTotal)}

Notes:
${details.notes || "No notes provided"}`;

  window.open("https://wa.me/94760505866?text=" + encodeURIComponent(message), "_blank");
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

const renderModalPhoto = () => {
  if (!modalPhoto) {
    return;
  }

  if (!activeModalImages.length) {
    modalPhoto.innerHTML = "<span>Photo will be placed here</span>";
    modalPhoto.classList.remove("media-placeholder--image", "media-placeholder--slideshow");
    return;
  }

  const activeImage = activeModalImages[activeModalImageIndex] || activeModalImages[0];
  const hasSlideshow = activeModalImages.length > 1;

  modalPhoto.classList.add("media-placeholder--image");
  modalPhoto.classList.toggle("media-placeholder--slideshow", hasSlideshow);
  modalPhoto.innerHTML = `
    <img
      src="${activeImage.src}"
      alt="${activeImage.alt}"
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
  modalIncludes.innerHTML = selectedPackage.includes.map((item) => `<li>${item}</li>`).join("");
  activeModalImages = selectedPackage.images || (selectedPackage.image ? [selectedPackage.image] : []);
  activeModalImageIndex = 0;
  renderModalPhoto();
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

if (checkoutDateInput) {
  checkoutDateInput.addEventListener("input", () => {
    checkoutDateInput.value = formatCheckoutDateTyping(checkoutDateInput.value);
  });

  checkoutDateInput.addEventListener("blur", () => {
    checkoutDateInput.value = formatCheckoutDate(checkoutDateInput.value);
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
          details.date && !parseCheckoutDate(details.date)
            ? "Please enter the preferred date as DD/MM/YYYY."
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
  closeCart();
  closeCheckout();
});

loadCart();
selectedPaymentMethod = localStorage.getItem("surprisewalaPaymentMethod") || "card";
selectedInstallmentMethod = localStorage.getItem("surprisewalaInstallmentMethod") || "koko";
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
    const formattedTime = formatDisplayTime(date);
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
Date: ${formattedDate || "Not provided"}
Time: ${formattedTime || "Not provided"}
Location: ${location}
Budget: ${budget}

My Idea:
${customMessage}

Please send me more details.`;

    const url = "https://wa.me/94760505866?text=" + encodeURIComponent(message);

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
    const packageFilter = link.dataset.menuPackageFilter;

    if (href.startsWith("#")) {
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
