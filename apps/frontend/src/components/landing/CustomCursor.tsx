"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { SPRING_CURSOR_DOT, SPRING_CURSOR_RING } from "@/lib/motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const dotX = useSpring(mouseX, SPRING_CURSOR_DOT);
  const dotY = useSpring(mouseY, SPRING_CURSOR_DOT);
  const ringX = useSpring(mouseX, SPRING_CURSOR_RING);
  const ringY = useSpring(mouseY, SPRING_CURSOR_RING);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // Hide under reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setVisible(true);

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor='hover']")
      ) {
        setHovering(true);
      }
    };

    const handleOut = () => setHovering(false);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Dot — 10px olive */}
      <motion.div
        className="pointer-events-none fixed z-[60] rounded-full bg-olive"
        style={{
          width: 10,
          height: 10,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          scale: hovering ? 0.5 : 1,
        }}
      />
      {/* Ring — 32px olive border */}
      <motion.div
        className="pointer-events-none fixed z-[60] rounded-full border-[1.5px] border-olive"
        style={{
          width: 32,
          height: 32,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: hovering ? 1.6 : 1,
          backgroundColor: hovering ? "rgba(85,107,47,0.10)" : "transparent",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
