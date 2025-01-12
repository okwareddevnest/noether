'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

export function TracingBeam({
  children,
  className = "",
}: TracingBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const windowHeight = scrollHeight - clientHeight;
      const currentProgress = (scrollTop / windowHeight) * 100;
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className="absolute left-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-neutral-800 to-transparent"
        style={{
          transform: `translateY(${progress}%)`,
        }}
      />
      <div className="ml-4 h-full w-full">{children}</div>
    </div>
  );
} 