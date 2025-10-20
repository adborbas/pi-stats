export function bytesAuto(n: number) {
  const kb = 1024, mb = kb*1024, gb = mb*1024;
  if (n >= gb) return `${(n/gb).toFixed(2)} GB`;
  if (n >= mb) return `${(n/mb).toFixed(1)} MB`;
  if (n >= kb) return `${(n/kb).toFixed(0)} KB`;
  return `${n} B`;
}