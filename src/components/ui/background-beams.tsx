'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface BackgroundBeamsProps {
  className?: string;
}

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  const beamsRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const beams = beamsRef.current;
    if (!beams) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = beams.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const updateBeams = () => {
      const { x, y } = mousePosition.current;
      const beamElements = beams.querySelectorAll(".beam");

      beamElements.forEach((beam, index) => {
        const angle = (index / beamElements.length) * Math.PI * 2;
        const distance = 50;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        (beam as HTMLElement).style.transform = `translate(${x + offsetX}px, ${
          y + offsetY
        }px)`;
      });

      animationFrameId.current = requestAnimationFrame(updateBeams);
    };

    beams.addEventListener("mousemove", handleMouseMove);
    updateBeams();

    return () => {
      beams.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-30 overflow-hidden opacity-20",
        className
      )}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="beam absolute h-px w-[100px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent"
          style={{
            transform: `rotate(${(index / 8) * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
} 