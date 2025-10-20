"use client";

import type { ReactNode } from "react";

export function CardGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid items-start gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}