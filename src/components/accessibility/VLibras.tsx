"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
  }
}

export function VLibras() {
  useEffect(() => {
    if (document.getElementById("vlibras-plugin")) return;

    const script = document.createElement("script");
    script.id = "vlibras-plugin";
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget("https://www.vlibras.gov.br/app");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.getElementById("vlibras-plugin")?.remove();
    };
  }, []);

  return (
    <div {...({ vw: "" } as Record<string, string>)} className="enabled">
      <div vw-access-button className="active" />
      <div vw-plugin-wrapper>
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}
