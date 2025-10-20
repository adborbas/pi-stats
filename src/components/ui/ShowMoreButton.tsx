"use client";

import { Button } from "@/components/ui/button";

export function ShowMoreButton({
  expanded,
  onToggle,
  className = "",
  labelMore = "Show more",
  labelLess = "Show less",
  disabled = false,
}: {
  expanded: boolean;
  onToggle: () => void;
  className?: string;
  labelMore?: string;
  labelLess?: string;
  disabled?: boolean;
}) {
  const text = expanded ? labelLess : labelMore;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-7 px-2 ${className}`}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={text}
      disabled={disabled}
    >
      {text}
    </Button>
  );
}