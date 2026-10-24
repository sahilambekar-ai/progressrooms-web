"use client";

import Image from "next/image";

export interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  variant?: "emerald" | "white" | "dark" | "sage" | "gold" | "tile-dark" | "tile-light";
  className?: string;
  showText?: boolean;
  subtitle?: string;
  textColor?: string;
}

export function BrandLogo({
  size = "md",
  variant = "emerald",
  className = "",
  showText = false,
  subtitle,
  textColor,
}: BrandLogoProps) {
  let px = 36;
  if (typeof size === "number") {
    px = size;
  } else {
    switch (size) {
      case "xs":
        px = 20;
        break;
      case "sm":
        px = 28;
        break;
      case "md":
        px = 36;
        break;
      case "lg":
        px = 48;
        break;
      case "xl":
        px = 64;
        break;
    }
  }

  let src = "/brand/logo-transparent.png";
  if (variant === "white") src = "/brand/logo-white.png";
  else if (variant === "dark") src = "/brand/logo-dark.png";
  else if (variant === "sage") src = "/brand/logo-sage.png";
  else if (variant === "gold") src = "/brand/logo-gold.png";

  const renderIcon = () => {
    if (variant === "tile-dark") {
      return (
        <div
          style={{ width: px, height: px }}
          className={`rounded-2xl bg-gradient-to-br from-[#0C2417] to-[#1b4332] p-2 flex items-center justify-center shadow-md shrink-0 ${className}`}
        >
          <Image
            src="/brand/logo-white.png"
            alt="Progress Rooms Emblem"
            width={px}
            height={px}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      );
    }

    if (variant === "tile-light") {
      return (
        <div
          style={{ width: px, height: px }}
          className={`rounded-2xl bg-[#FAF7F2] border border-[#CEDECF] p-2 flex items-center justify-center shadow-sm shrink-0 ${className}`}
        >
          <Image
            src="/brand/logo-transparent.png"
            alt="Progress Rooms Emblem"
            width={px}
            height={px}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      );
    }

    return (
      <div style={{ width: px, height: px }} className={`relative shrink-0 ${className}`}>
        <Image
          src={src}
          alt="Progress Rooms Emblem"
          width={px}
          height={px}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    );
  };

  if (!showText) {
    return renderIcon();
  }

  return (
    <div className="flex items-center space-x-3 group">
      {renderIcon()}
      <div>
        <span
          className={`font-serif font-bold tracking-tight text-xl sm:text-2xl leading-none block ${
            textColor || "text-[#0C2417]"
          }`}
        >
          Progress Rooms
        </span>
        <span className="block text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-[#81A882] mt-0.5">
          {subtitle || "Virtual Studio OS"}
        </span>
      </div>
    </div>
  );
}
