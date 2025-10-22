"use client";

import { Progress } from "@/components/ui/progress";

export function PerCoreList({ values }: { values: number[] }) {
    return (
        <div className="mt-3 space-y-2">
            {values.map((v, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Core {i}</span>
                        <span className="tabular-nums">{v.toFixed(1)}%</span>
                    </div>
                    <Progress value={v} className="h-2" />
                </div>
            ))}
        </div>
    );
}