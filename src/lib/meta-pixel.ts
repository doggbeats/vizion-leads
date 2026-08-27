declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: Window["fbq"];
  }
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "BRL",
  });
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "BRL",
  });
}

export function trackPurchase(data: { value: number; content_ids: string[] }) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "Purchase", {
    content_ids: data.content_ids,
    value: data.value,
    currency: "BRL",
  });
}

export function trackInitiateCheckout(data: { value: number; num_items: number }) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "InitiateCheckout", {
    value: data.value,
    num_items: data.num_items,
    currency: "BRL",
  });
}
