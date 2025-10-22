"use client";

import type { ReactNode } from "react";

export function ListStack({ children, gap = "md" }: { children: ReactNode; gap?: "sm" | "md" | "lg" }) {
    const gapClass = gap === "lg" ? "space-y-4" : gap === "sm" ? "space-y-2" : "space-y-3";
    return <div className={gapClass}>{children}</div>;
}