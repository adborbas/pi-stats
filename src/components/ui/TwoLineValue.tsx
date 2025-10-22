"use client";

export function TwoLineValue({
    primary,
    secondary,
    align = "end",
}: {
    primary: string;
    secondary: string;
    align?: "start" | "end";
}) {
    const alignClass = align === "start" ? "items-start" : "items-end";
    return (
        <span className={`inline-flex flex-col ${alignClass}`}>
            <span className="font-medium">{primary}</span>
            <span className="text-xs text-muted-foreground">{secondary}</span>
        </span>
    );
}