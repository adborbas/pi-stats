"use client";
import type { ReactNode } from "react";

export type StatListProps = {
  children: ReactNode;
  gap?: "tight" | "normal";
  className?: string;
};

export function StatList({ children, gap = "normal", className }: StatListProps) {
  const gapCls = gap === "tight" ? "space-y-1.5" : "space-y-2";
  return <div className={`${gapCls} ${className ?? ""}`}>{children}</div>;
}