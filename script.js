const siteHeader = document.querySelector(".site-header");
const revealItems = document.querySelectorAll(".reveal");
const orderForm = document.querySelector("#order-form");

const whatsappNumber = "94720626224";
const defaultMessage = "Hi Surprisewala, I'd like to place an order";

const buildWhatsAppUrl = (message) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

const handleScrollState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 30);
};

handleScrollState();
window.addEventListener("scroll", handleScrollState, { passive: true });

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const name = formData.get("name")?.toString().trim() || "-";
    const phone = formData.get("phone")?.toString().trim() || "-";
    const occasion = formData.get("occasion")?.toString().trim() || "-";
    const dateTime = formData.get("dateTime")?.toString().trim() || "-";
    const packageChoice = formData.get("package")?.toString().trim() || "-";
    const customMessage = formData.get("message")?.toString().trim() || "No additional details";

    const whatsappMessage = [
      defaultMessage,
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Occasion: ${occasion}`,
      `Date & Time: ${dateTime}`,
      `Package: ${packageChoice}`,
      `Custom Message: ${customMessage}`,
    ].join("\n");

    window.open(buildWhatsAppUrl(whatsappMessage), "_blank", "noopener,noreferrer");
  });
}
