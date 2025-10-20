"use client";

import type { Tone } from "@/utils/tone";

type Size = "xs" | "sm" | "md";

export function StatusDot({
  tone = "neutral",
  size = "sm",
  pulse = false,
  className = "",
  title,
}: {
  tone?: Tone;
  size?: Size;
  pulse?: boolean;
  className?: string;
  title?: string;
}) {
  const bg =
    tone === "good"
      ? "bg-green-500"
      : tone === "warn"
      ? "bg-orange-500"
      : tone === "bad"
      ? "bg-red-500"
      : "bg-muted-foreground/50";

  const dims =
    size === "xs"
      ? "h-1.5 w-1.5"
      : size === "md"
      ? "h-2.5 w-2.5"
      : "h-2 w-2";

  return (
    <span
      className={[
        "inline-block rounded-full",
        bg,
        dims,
        pulse ? "animate-pulse" : "",
        className,
      ].join(" ")}
      title={title}
      aria-label={title ?? tone}
    />
  );
}