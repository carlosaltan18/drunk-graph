import { ArrowRight } from "lucide-react";
import type React from "react";

interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "admin" | "client";
  size?: "sm" | "md" | "lg" | "xl";
  showArrow?: boolean;
}
export const BrandButton: React.FC<BrandButtonProps> = ({
  children,
  variant = "client",
  size = "md",
  showArrow = false,
  className = "",
  disabled,
  ...props
}) => {
  const isAdmin = variant === "admin";
  const baseStyles =
    "relative inline-flex items-center justify-center font-black uppercase tracking-tighter transition-all active:scale-[0.97] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = isAdmin
    ? "bg-amber-400 text-black hover:bg-amber-300"
    : "bg-orange-500 text-black hover:bg-orange-400";
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-6 text-2xl",
  };
  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[length:4px_4px]" />

      <span className="relative z-10 flex items-center gap-2">
        {children}
        {showArrow && (
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        )}
      </span>

      {/* Brutalist Shadow Effect */}
      <div
        className={`absolute bottom-0 right-0 w-full h-1 opacity-20 bg-black`}
      />
    </button>
  );
};
