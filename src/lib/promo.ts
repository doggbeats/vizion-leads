import type { CartItem } from "./types";

export type PromoGroup = {
  promoQuantity: number;
  promoPrice: number;
  items: { productId: string; size: string; quantity: number; unitPrice: number }[];
  totalQty: number;
  groups: number;
  remaining: number;
  groupTotal: number;
  remainingTotal: number;
  normalTotal: number;
};

export type PromoResult = {
  groups: PromoGroup[];
  total: number;
  totalSaved: number;
  hasPromo: boolean;
};

export function calculateCartTotal(items: CartItem[]): PromoResult {
  const promoMap = new Map<string, {
    promoQuantity: number;
    promoPrice: number;
    items: { productId: string; size: string; quantity: number; unitPrice: number }[];
  }>();

  const normalItems: CartItem[] = [];

  for (const item of items) {
    const p = item.product;
    if (p.promoQuantity && p.promoQuantity > 1 && p.promoPrice && p.promoPrice > 0) {
      const key = `${p.promoQuantity}-${p.promoPrice}`;
      const existing = promoMap.get(key);
      const unitPrice = p.promotionalPrice ?? p.price;
      const entry = { productId: p.id, size: item.size, quantity: item.quantity, unitPrice };
      if (existing) {
        existing.items.push(entry);
      } else {
        promoMap.set(key, {
          promoQuantity: p.promoQuantity,
          promoPrice: p.promoPrice,
          items: [entry],
        });
      }
    } else {
      normalItems.push(item);
    }
  }

  const result: PromoGroup[] = [];
  let total = 0;
  let totalSaved = 0;

  for (const [, group] of promoMap) {
    const totalQty = group.items.reduce((s, i) => s + i.quantity, 0);
    const groups = Math.floor(totalQty / group.promoQuantity);
    const remaining = totalQty % group.promoQuantity;

    const groupTotal = groups * group.promoPrice;
    const remainingTotal = remaining * group.items[0].unitPrice;
    const normalTotal = totalQty * group.items[0].unitPrice;
    const normalGroupTotal = groups * group.promoQuantity * group.items[0].unitPrice;

    total += groupTotal + remainingTotal;
    totalSaved += normalGroupTotal - groupTotal;

    result.push({
      promoQuantity: group.promoQuantity,
      promoPrice: group.promoPrice,
      items: group.items,
      totalQty,
      groups,
      remaining,
      groupTotal,
      remainingTotal,
      normalTotal,
    });
  }

  for (const item of normalItems) {
    const unitPrice = item.product.promotionalPrice ?? item.product.price;
    total += item.quantity * unitPrice;
  }

  return {
    groups: result,
    total,
    totalSaved,
    hasPromo: result.length > 0,
  };
}
