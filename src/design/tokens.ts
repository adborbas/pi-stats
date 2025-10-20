export const colors = {
  text: {
    dim: "text-muted-foreground",
    strong: "text-foreground",
    danger: "text-red-500",
    warn: "text-orange-500",
    ok: "text-green-500",
  },
};

export const thresholds = {
  loadPct: { warn: 70, bad: 90 },
  memPct:  { warn: 75, bad: 90 },
  diskPct: { warn: 80, bad: 95 },
  tempC:   { warn: 70, bad: 80 },
};