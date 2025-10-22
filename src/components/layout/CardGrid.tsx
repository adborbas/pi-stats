"use client";

import { Children, isValidElement, type ReactNode, useEffect, useState } from "react";

export function CardGrid({
  children,
  className = "",
  targetColumnWidth = 480,
  gap = 16,
}: {
  children: ReactNode;
  className?: string;
  targetColumnWidth?: number;
  gap?: number;
}) {
  const twoColWidth = 2 * targetColumnWidth + gap;
  const [vw, setVw] = useState<number>(0);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isTwoCols = vw >= twoColWidth;
  const containerMax = isTwoCols ? twoColWidth : targetColumnWidth;

  const items = Children.toArray(children).map((child, idx) => (
    <div
      key={idx}
      className="mb-4"
      style={{ paddingBottom: gap / 2, minWidth: targetColumnWidth }}
    >
      {isValidElement(child) ? child : <>{child}</>}
    </div>
  ));

  if (!isTwoCols) {
    return (
      <div className={["mx-auto w-full", "px-4", className].join(" ")} style={{ maxWidth: containerMax }}>
        <div>{items}</div>
      </div>
    );
  }

  const left: ReactNode[] = [];
  const right: ReactNode[] = [];
  for (let i = 0; i < items.length; i++) {
    (i % 2 === 0 ? left : right).push(items[i]);
  }

  return (
    <div className={["mx-auto w-full", "px-4", className].join(" ")} style={{ maxWidth: containerMax }}>
      <div className="flex" style={{ columnGap: gap, gap }}>
        <div style={{ width: targetColumnWidth }}>{left}</div>
        <div style={{ width: targetColumnWidth }}>{right}</div>
      </div>
    </div>
  );
}