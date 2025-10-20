export const format = {
  number(n: number, digits = 2) {
    return Number.isFinite(n) ? n.toFixed(digits) : "n/a";
  },
  mb(n: number, digits = 1) {
    return Number.isFinite(n) ? `${n.toFixed(digits)} MB` : "n/a";
  },
  gb(n: number, digits = 2) {
    return Number.isFinite(n) ? `${n.toFixed(digits)} GB` : "n/a";
  },
  pct(n: number, digits = 0) {
    return Number.isFinite(n) ? `${n.toFixed(digits)}%` : "n/a";
  },
  mbps(n: number, digits = 2) {
    return Number.isFinite(n) ? `${n.toFixed(digits)} Mbps` : "n/a";
  },
};