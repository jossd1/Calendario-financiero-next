"use client";

import { useState } from "react";
import { APP_ICONS, type AppIconName } from "@/lib/icons";

interface AppIconProps {
  name: AppIconName;
  size?: number;
  className?: string;
}

export default function AppIcon({
  name,
  size = 15,
  className = "",
}: AppIconProps) {
  const def = APP_ICONS[name];
  const [usarFallback, setUsarFallback] = useState(false);

  if (usarFallback) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {def.fallback}
      </span>
    );
  }

  return (
    <img
      src={def.src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      onError={() => setUsarFallback(true)}
      className={`app-svg-icon ${className}`.trim()}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}