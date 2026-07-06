"use client";

import { motion } from "framer-motion";
import { SPRING_SNAPPY } from "@/lib/motion";

interface ButtonProps {
  variant?: "primary" | "secondary" | "destructive";
  children: React.ReactNode;
  className?: string;
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  title?: string;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  as = "button",
  href,
  onClick,
  disabled,
  type = "button",
  title,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-satoshi font-medium text-body px-6 py-3 rounded-button transition-shadow duration-[250ms] cursor-pointer";

  const variantStyles = {
    primary: "bg-olive text-cream shadow-card hover:shadow-lift",
    secondary:
      "bg-transparent border border-tan text-espresso shadow-card hover:shadow-lift hover:border-olive",
    destructive: "bg-clay text-cream shadow-card hover:shadow-lift",
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  if (as === "a" && href) {
    return (
      <motion.a
        href={href}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={SPRING_SNAPPY}
        className={`${combinedClassName} no-underline`}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={SPRING_SNAPPY}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
    >
      {children}
    </motion.button>
  );
}
