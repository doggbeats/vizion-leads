export type CheckoutData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  documentoTipo: "CPF" | "CNPJ";
  documento: string;
};

const STORAGE_KEY = "vizion-checkout";

export function saveCheckoutData(data: CheckoutData): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // armazenamento indisponível
  }
}

export function loadCheckoutData(): CheckoutData | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutData;
  } catch {
    return null;
  }
}

export function clearCheckoutData(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // armazenamento indisponível
  }
}
