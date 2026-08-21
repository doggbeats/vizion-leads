"use client";

import { useEffect, useState } from "react";
import {
  Accessibility,
  Contrast,
  Link2,
  Minus,
  Mountain,
  MousePointerClick,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type A11yOption =
  | "high-contrast"
  | "monochrome"
  | "highlight-links";

const STORAGE_KEY = "vizion-a11y";

interface A11yState {
  fontLevel: number;
  options: A11yOption[];
  readOnHover: boolean;
}

const DEFAULT_STATE: A11yState = {
  fontLevel: 0,
  options: [],
  readOnHover: false,
};

const READABLE_TAGS = new Set([
  "a",
  "button",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "label",
  "li",
  "dt",
  "dd",
  "summary",
  "figcaption",
  "blockquote",
  "th",
  "td",
]);

function getHoverText(element: Element): string {
  if (element.closest('[aria-hidden="true"]')) return "";
  if (element.closest("[hidden]")) return "";

  const tag = element.tagName.toLowerCase();
  if (tag === "svg" || tag === "script" || tag === "style" || tag === "noscript") {
    return "";
  }

  const label = element.getAttribute("aria-label");
  if (label?.trim()) return label.trim();

  if (tag === "img") {
    const alt = (element as HTMLImageElement).alt?.trim();
    return alt ? `Imagem: ${alt}` : "Imagem";
  }

  if (tag === "input" || tag === "select" || tag === "textarea") {
    const input = element as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    const wrapperLabel = element.closest("label")?.textContent
      ?.replace(/\s+/g, " ")
      .trim();
    const placeholder = input.getAttribute("placeholder");
    const fallback =
      wrapperLabel ||
      placeholder ||
      (tag === "input"
        ? (input as HTMLInputElement).type
        : tag === "select"
          ? "seletor"
          : "área de texto");
    return `Campo: ${fallback}`;
  }

  if (!READABLE_TAGS.has(tag)) {
    const parent = element.closest(
      "a, button, h1, h2, h3, h4, h5, h6, p, label, li, dt, dd, summary, figcaption, [aria-label]",
    );
    if (parent && parent !== element) return getHoverText(parent);
    return "";
  }

  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.slice(0, 200);
}

function loadState(): A11yState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<A11yState>;
    return {
      fontLevel: Math.max(-2, Math.min(2, parsed.fontLevel ?? 0)),
      options: Array.isArray(parsed.options) ? parsed.options : [],
      readOnHover: parsed.readOnHover === true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    return loadState();
  });
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const { documentElement } = document;

    documentElement.classList.toggle("a11y-font-1", state.fontLevel === 1);
    documentElement.classList.toggle("a11y-font-2", state.fontLevel === 2);
    documentElement.classList.toggle("a11y-font-m1", state.fontLevel === -1);
    documentElement.classList.toggle("a11y-font-m2", state.fontLevel === -2);

    documentElement.classList.toggle(
      "a11y-high-contrast",
      state.options.includes("high-contrast"),
    );
    documentElement.classList.toggle(
      "a11y-monochrome",
      state.options.includes("monochrome"),
    );
    documentElement.classList.toggle(
      "a11y-highlight-links",
      state.options.includes("highlight-links"),
    );

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // armazenamento indisponível
    }
  }, [state]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", handleVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoices);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!state.readOnHover) return;
    if (!window.speechSynthesis) return;

    let timer: number | undefined;
    let lastSpoken: Element | null = null;

    const speak = (element: Element) => {
      if (element === lastSpoken) return;
      const text = getHoverText(element);
      if (!text) return;
      lastSpoken = element;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("pt"),
      );
      if (ptVoice) utterance.voice = ptVoice;
      window.speechSynthesis.speak(utterance);
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-a11y-widget]")) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => speak(target), 350);
    };

    document.addEventListener("mouseover", onMouseOver, true);
    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("mouseover", onMouseOver, true);
      window.speechSynthesis.cancel();
    };
  }, [state.readOnHover]);

  function collectVisibleText(): string {
    const parts: string[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const el = node.parentElement;
          if (!el) return NodeFilter.FILTER_REJECT;
          const tag = el.tagName.toLowerCase();
          if (["script", "style", "noscript", "svg", "textarea", "input"].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (el.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
          if (el.closest("[hidden]")) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(el);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.visibility === "collapse"
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.textContent?.trim();
          if (!text) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.replace(/\s+/g, " ").trim();
      if (text) parts.push(text);
    }
    return parts.join(". ");
  }

  function readPage() {
    if (!window.speechSynthesis) return;

    if (state.readOnHover) {
      setState((prev) => ({ ...prev, readOnHover: false }));
    }

    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }

    const text = collectVisibleText();
    if (!text) return;

    const segments = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
    let index = 0;

    const speakNext = () => {
      if (index >= segments.length) {
        setReading(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segments[index].trim());
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const ptVoice =
        voices.find((voice) => voice.lang.toLowerCase().startsWith("pt")) ??
        voices.find((voice) => voice.lang.toLowerCase().startsWith("pt-br"));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        index += 1;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    setReading(true);
    speakNext();
  }

  function toggleReadOnHover() {
    const next = !state.readOnHover;
    if (next) {
      setReading(false);
      window.speechSynthesis?.cancel();
    }
    setState((prev) => ({ ...prev, readOnHover: next }));
  }

  function changeFont(step: number) {
    setState((prev) => ({
      ...prev,
      fontLevel: Math.max(-2, Math.min(2, prev.fontLevel + step)),
    }));
  }

  function toggleOption(option: A11yOption) {
    setState((prev) => ({
      ...prev,
      options: prev.options.includes(option)
        ? prev.options.filter((item) => item !== option)
        : [...prev.options, option],
    }));
  }

  function reset() {
    setState(DEFAULT_STATE);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={open ? "Fechar painel de acessibilidade" : "Abrir painel de acessibilidade"}
        title="Acessibilidade"
        data-a11y-widget
        className="fixed bottom-4 right-3 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-brand text-ink shadow-lg shadow-black/40 transition-transform hover:scale-105 sm:right-4 sm:h-11 sm:w-11"
      >
        {open ? <X size={22} /> : <Accessibility size={22} />}
      </button>

      {open ? (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Opções de acessibilidade"
          data-a11y-widget
          className="fixed bottom-16 right-3 z-[60] w-52 rounded-xl border border-graphite-border bg-graphite p-2.5 shadow-xl shadow-black/50 sm:bottom-16 sm:right-4 sm:w-72 sm:rounded-2xl sm:p-4"
        >
          <div className="grid grid-cols-2 gap-2">
            <A11yButton
              icon={<Plus size={16} />}
              label="Aumentar fonte"
              onClick={() => changeFont(1)}
            />
            <A11yButton
              icon={<Minus size={16} />}
              label="Diminuir fonte"
              onClick={() => changeFont(-1)}
            />
            <A11yButton
              icon={<Contrast size={16} />}
              label="Alto contraste"
              active={state.options.includes("high-contrast")}
              onClick={() => toggleOption("high-contrast")}
            />
            <A11yButton
              icon={<Mountain size={16} />}
              label="Escala de cinza"
              active={state.options.includes("monochrome")}
              onClick={() => toggleOption("monochrome")}
            />
            <A11yButton
              icon={<Link2 size={16} />}
              label="Destacar links"
              active={state.options.includes("highlight-links")}
              onClick={() => toggleOption("highlight-links")}
              className="col-span-2"
            />
          </div>

          <button
            type="button"
            onClick={readPage}
            aria-pressed={reading}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              reading
                ? "border-brand bg-brand/10 text-brand"
                : "border-graphite-border text-neutral-300 hover:border-brand hover:text-brand"
            }`}
          >
            {reading ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {reading ? "Parar leitura" : "Ouvir a página"}
          </button>

          <button
            type="button"
            onClick={toggleReadOnHover}
            aria-pressed={state.readOnHover}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              state.readOnHover
                ? "border-brand bg-brand/10 text-brand"
                : "border-graphite-border text-neutral-300 hover:border-brand hover:text-brand"
            }`}
          >
            <MousePointerClick size={16} />
            {state.readOnHover
              ? "Parar leitura ao passar o mouse"
              : "Ler ao passar o mouse"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-graphite-border py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-brand hover:text-brand"
          >
            <RotateCcw size={14} />
            Redefinir
          </button>
        </div>
      ) : null}
    </>
  );
}

function A11yButton({
  icon,
  label,
  onClick,
  active = false,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-medium transition-colors sm:gap-1.5 sm:px-3 sm:py-3 sm:text-xs ${
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-graphite-border text-neutral-300 hover:border-brand hover:text-brand"
      } ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
