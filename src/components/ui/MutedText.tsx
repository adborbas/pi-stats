"use client";

export function MutedText({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
    const sizeClass = size === "xs" ? "text-xs" : "text-sm";
    return <div className={`${sizeClass} text-muted-foreground`}>{text}</div>;
}