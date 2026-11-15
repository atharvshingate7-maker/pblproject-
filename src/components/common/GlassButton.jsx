import React from "react";

// SVG Distortion Filter Component
export const GlassFilter = () => (
  <svg
    style={{ display: "none", position: "absolute", width: 0, height: 0 }}
    aria-hidden="true"
  >
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

// Glass Effect Wrapper Component matching the requested specification
export const GlassEffect = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  variant = "glass", // 'primary' | 'glass' | 'dark'
  onClick,
  ...props
}) => {
  const isPrimary = variant === "primary";
  const isDark = variant === "dark";

  const glassStyle = {
    boxShadow: isPrimary
      ? "0 6px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)"
      : "0 6px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.08)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const bgStyle = isPrimary
    ? "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)"
    : isDark
    ? "rgba(18, 18, 22, 0.9)"
    : "rgba(255, 255, 255, 0.12)";

  const content = (
    <div
      className={`relative inline-flex items-center justify-center font-semibold overflow-hidden ${
        isPrimary ? "text-black" : "text-white"
      } cursor-pointer transition-all duration-700 ${className}`}
      style={glassStyle}
      onClick={onClick}
      {...props}
    >
      {/* Glass Layer 1: Clean High-Def Frosted Glass */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-inherit"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "inherit",
        }}
      />
      {/* Glass Layer 2: Theme Tint Sheen */}
      <div
        className="absolute inset-0 z-10 rounded-inherit"
        style={{
          background: bgStyle,
          borderRadius: "inherit",
        }}
      />
      {/* Glass Layer 3: Specular Inset Reflections */}
      <div
        className="absolute inset-0 z-20 rounded-inherit overflow-hidden pointer-events-none"
        style={{
          boxShadow: isPrimary
            ? "inset 2px 2px 1.5px 0 rgba(255, 255, 255, 0.9), inset -1px -1px 1.5px 1px rgba(0, 0, 0, 0.3)"
            : "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.2)",
          borderRadius: "inherit",
        }}
      />

      {/* Content with scale bounce on hover */}
      <div
        className="relative z-30 inline-flex items-center justify-center gap-2 transition-all duration-700 hover:scale-95"
        style={{
          transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
        }}
      >
        {children}
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      className="inline-block no-underline"
    >
      {content}
    </a>
  ) : (
    content
  );
};

// Dock Component for icons (as requested in user's snippet)
export const GlassDock = ({ icons = [], href, className = "" }) => (
  <GlassEffect
    href={href}
    className={`rounded-3xl p-3 hover:p-4 hover:rounded-4xl ${className}`}
  >
    <div className="flex items-center justify-center gap-2 rounded-3xl p-3 py-0 px-0.5 overflow-hidden">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon.src}
          alt={icon.alt || `Dock icon ${index}`}
          className="w-14 h-14 transition-all duration-700 hover:scale-110 cursor-pointer"
          style={{
            transformOrigin: "center center",
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
          }}
          onClick={icon.onClick}
        />
      ))}
    </div>
  </GlassEffect>
);

// Button Component with Glass Effect
export const GlassButton = ({
  children,
  href,
  onClick,
  className = "",
  variant = "glass",
  size = "md",
  disabled = false,
  style = {},
  ...props
}) => {
  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs rounded-full",
    md: "px-6 py-2.5 text-sm rounded-full",
    lg: "px-8 py-3.5 text-base rounded-full",
    icon: "p-2.5 rounded-full",
  }[size] || "px-6 py-2.5 text-sm rounded-full";

  return (
    <GlassEffect
      href={href}
      onClick={!disabled ? onClick : undefined}
      variant={variant}
      className={`${sizeClasses} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
      style={style}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </GlassEffect>
  );
};

export default GlassButton;
