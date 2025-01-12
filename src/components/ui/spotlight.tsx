'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({
  className = "",
  fill = "white",
}: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = div.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseXRef.current = x;
      mouseYRef.current = y;
      
      div.style.setProperty("--mouse-x", `${x}px`);
      div.style.setProperty("--mouse-y", `${y}px`);
    };

    div.addEventListener("mousemove", handleMouseMove);

    return () => {
      div.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute",
        className
      )}
      style={{
        background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), ${fill}10, transparent 40%)`,
      }}
    />
  );
} 