export type FreteData = {
  cep: string;
  valor: number;
  prazo: number;
  servico: string;
  transportadora: string;
};

export type CheckoutData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  frete?: FreteData | null;
  retirada?: boolean;
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

export type PaymentItem = {
  productName: string;
  price: number;
  quantity: number;
  size: string;
};

export type PaymentAddress = {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type PaymentData = {
  orderId: string;
  total: number;
  frete: number;
  desconto: number;
  items: PaymentItem[];
  customerName: string;
  customerPhone: string;
  retirada: boolean;
  address?: PaymentAddress | null;
};

const PAYMENT_STORAGE_KEY = "vizion-payment";

export function savePaymentData(data: PaymentData): void {
  try {
    window.sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // armazenamento indisponível
  }
}

export function loadPaymentData(): PaymentData | null {
  try {
    const raw = window.sessionStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PaymentData;
  } catch {
    return null;
  }
}

export function clearPaymentData(): void {
  try {
    window.sessionStorage.removeItem(PAYMENT_STORAGE_KEY);
  } catch {
    // armazenamento indisponível
  }
}
