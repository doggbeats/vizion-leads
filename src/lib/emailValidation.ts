import { resolveMx } from "dns/promises";
import type { MxRecord } from "dns";

const EMAIL_FORMAT_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "mailinator.net",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "tmail.ws",
  "tmailor.com",
  "tempail.com",
  "tempinbox.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "yopmail.org",
  "maildrop.cc",
  "mailnesia.com",
  "dispostable.com",
  "getnada.com",
  "nada.email",
  "moakt.com",
  "emailondeck.com",
  "mytemp.email",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "trashmail.me",
  "spamgourmet.com",
  "spambox.us",
  "spamfree24.org",
  "maileater.com",
  "mailcatch.com",
  "mintemail.com",
  "jetable.org",
  "discard.email",
  "fakeinbox.com",
  "fakemail.net",
  "fakemailgenerator.com",
  "mailtemp.net",
  "mailmetrash.com",
  "mytrashmail.com",
  "maillist.in",
  "inboxalias.com",
  "flashmail.com",
  "emailtemporario.com.br",
  "emailtemporario.net",
  "emailtemporario.org",
  "e-tempmail.com",
  "owlymail.com",
  "luxusmail.org",
  "33mail.com",
  "burnermail.io",
  "anonaddy.com",
  "throwawaymail.com",
  "throwaway.io",
  "thrott.com",
  "cellurl.com",
  "e4ward.com",
  "developermail.com",
  "mailsac.com",
  "mailinator2.com",
  "mailinator3.com",
]);

const MX_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 5000;

const mxCache = new Map<string, { valid: boolean; expiresAt: number }>();

function isDisposableDomain(domain: string): boolean {
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  const parts = domain.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join("."))) return true;
  }
  return false;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Lookup timed out")), ms);
  });
  return Promise.race([promise, timeout]);
}

async function resolveMxSystem(domain: string): Promise<MxRecord[]> {
  return withTimeout(resolveMx(domain), LOOKUP_TIMEOUT_MS);
}

type DnsJsonResponse = {
  Status: number;
  Answer?: { name: string; type: number; TTL: number; data: string }[];
};

async function resolveMxDoh(domain: string): Promise<MxRecord[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  const response = await fetch(url, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`DNS-over-HTTPS request failed with status ${response.status}`);
  }
  const data = (await response.json()) as DnsJsonResponse;
  if (data.Status !== 0) {
    return [];
  }
  return (data.Answer ?? []).filter((answer) => answer.type === 15).map((answer) => ({
    exchange: answer.data,
    priority: 0,
  }));
}

export async function hasValidMailServer(domain: string): Promise<boolean> {
  const cached = mxCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.valid;
  }

  let valid = false;
  for (const resolve of [resolveMxSystem, resolveMxDoh]) {
    try {
      const records = await resolve(domain);
      if (records.length > 0) {
        valid = true;
        break;
      }
    } catch {
      // tenta a próxima estratégia
    }
  }

  mxCache.set(domain, { valid, expiresAt: Date.now() + MX_CACHE_TTL_MS });
  return valid;
}

export type EmailValidationResult = {
  valid: boolean;
  error?: string;
};

export async function validateRealEmail(email: string): Promise<EmailValidationResult> {
  const normalized = email.trim().toLowerCase();

  if (!EMAIL_FORMAT_REGEX.test(normalized)) {
    return { valid: false, error: "Informe um e-mail válido." };
  }

  const domain = normalized.split("@")[1];

  if (isDisposableDomain(domain)) {
    return {
      valid: false,
      error: "E-mails temporários ou descartáveis não são permitidos.",
    };
  }

  const hasMx = await hasValidMailServer(domain);
  if (!hasMx) {
    return {
      valid: false,
      error: "Este e-mail não parece existir. Verifique o endereço e tente novamente.",
    };
  }

  return { valid: true };
}
