import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { categories } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/Container";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

const information = [
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Termos de uso", href: "/termos" },
  { label: "Trocas e devoluções", href: "/trocas" },
];

export function Footer() {
  return (
    <footer className="border-t border-graphite-border bg-graphite">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-display text-xl tracking-widest">
              <span className="text-white">VIZI</span>
              <span className="text-brand">ON</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            {siteConfig.fullName}. {siteConfig.tagline}. {siteConfig.slogan}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label="E-mail"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-graphite-border text-neutral-400 transition-colors hover:border-brand hover:text-brand"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <FooterColumn title="Navegação">
          {navigation.map((item) => (
            <FooterLink key={item.label} {...item} />
          ))}
        </FooterColumn>

        <FooterColumn title="Categorias">
          {categories.map((category) => (
            <FooterLink
              key={category.slug}
              label={category.name}
              href={`/produtos/${category.slug}`}
            />
          ))}
        </FooterColumn>

        <FooterColumn title="Atendimento">
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-400 transition-colors hover:text-brand"
          >
            WhatsApp {siteConfig.whatsappDisplay}
          </a>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-400 transition-colors hover:text-brand"
          >
            {siteConfig.instagram}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-sm text-neutral-400 transition-colors hover:text-brand"
          >
            {siteConfig.email}
          </a>
        </FooterColumn>

        <FooterColumn title="Informações">
          {information.map((item) => (
            <FooterLink key={item.label} {...item} />
          ))}
        </FooterColumn>
      </Container>

      <div className="border-t border-graphite-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-neutral-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.fullName}. Todos os direitos
            reservados.
          </p>
          <p>Criado por Paulo Henrique, vulgo DoggD_Code</p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-neutral-400 transition-colors hover:text-brand"
      >
        {label}
      </Link>
    </li>
  );
}
