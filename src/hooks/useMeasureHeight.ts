import { useLayoutEffect, useRef, useState } from "react";

export function useMeasureHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const recompute = () => {
    if (ref.current) setMaxHeight(ref.current.scrollHeight);
  };
  useLayoutEffect(() => {
    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { ref, maxHeight, recompute };
}