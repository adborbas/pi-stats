"use client";

import type { ReactNode } from "react";

export function Section({ children }: { children: ReactNode }) {
    return <div className="mt-3">{children}</div>;
}