"use client";

import { ProcessRow } from "@/components/rows/ProcessRow";

export type ProcItem = { pid: number; cmd: string; rssMB?: number; memPct?: number; cpuPct?: number };

export function ProcessList({ items }: { items: ProcItem[] }) {
    return (
        <ul className="space-y-1">
            {items.map((p) => (
                <li key={p.pid}>
                    {p.memPct != null ? (
                        <ProcessRow pid={p.pid} name={p.cmd} rssMB={Number(p.rssMB ?? 0)} memPct={Number(p.memPct)} />
                    ) : (
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="truncate max-w-[60%]">
                                {p.cmd} <span className="opacity-70">({p.pid})</span>
                            </span>
                            <span className="tabular-nums">{Number(p.cpuPct ?? 0).toFixed(1)}%</span>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}