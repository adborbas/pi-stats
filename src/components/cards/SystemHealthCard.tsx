"use client";

import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { StatusDot } from "@/components/ui/StatusDot";
import { useHealth } from "@/hooks/useCardData";

export default function SystemHealthCard() {
    // Fetch unified HealthSnapshot (no summary/details split)
    const { data: snap, error } = useHealth(5 * 60 * 1000);

    if (error) return <CardError title="System Health" />;
    if (!snap) return <CardLoading title="System Health" />;

    // Badge tone & label
    const tone: "good" | "warn" | "bad" | "neutral" =
        snap.overall === "crit" ? "bad" : snap.overall === "warn" ? "warn" : "good";

    const statusLabel = (() => {
        const bits: string[] = [];
        if (snap.reboot.required) bits.push("reboot required");
        if (snap.updates.count > 0) bits.push(`${snap.updates.count} updates`);
        if (snap.failed.count > 0)
            bits.push(`${snap.failed.count} failed service${snap.failed.count > 1 ? "s" : ""}`);
        if (snap.osUpgrade.available) bits.push("OS upgrade available");
        return bits.length ? `Health: ${bits.join(", ")}` : "Health: all good";
    })();

    // Row texts
    const rebootText = snap.reboot.required
        ? snap.reboot.sinceSec != null
            ? `Yes (since ${Math.floor(snap.reboot.sinceSec / 86400)}d)`
            : "Yes"
        : "No";

    const updatesText = `${snap.updates.count}${snap.updates.security > 0 ? ` (${snap.updates.security} security)` : ""}`;

    const updatesExamples = snap.updates.examples.length > 0
        ? `e.g., ${snap.updates.examples.slice(0, 4).join(", ")}`
        : "";

    const failedText = `${snap.failed.count}`;

    const failedList = snap.failed.services.length > 0
        ? `${snap.failed.services.slice(0, 3).join(", ")}${snap.failed.services.length > 3 ? ` +${snap.failed.services.length - 3}` : ""}`
        : "";

    const osUpgradeText = snap.osUpgrade.available
        ? snap.osUpgrade.candidate ?? "Available"
        : "Up-to-date";

    return (
        <CardShell
            title="System Health"
            actions={<StatusDot tone={tone} size="sm" title={statusLabel} />}
        >
            <StatList>
                <StatRow label="Reboot required" value={rebootText} />
                <StatRow
                    label="Updates"
                    value={
                        updatesExamples ? (
                            <span className="inline-flex flex-col items-end">
                                <span className="font-medium">{updatesText}</span>
                                <span className="text-xs text-muted-foreground">{updatesExamples}</span>
                            </span>
                        ) : (
                            <span className="font-medium">{updatesText}</span>
                        )
                    }
                />
                <StatRow
                    label="Failed services"
                    value={
                        failedList ? (
                            <span className="inline-flex flex-col items-end">
                                <span className="font-medium">{failedText}</span>
                                <span className="text-xs text-muted-foreground">{failedList}</span>
                            </span>
                        ) : (
                            <span className="font-medium">{failedText}</span>
                        )
                    }
                />
                <StatRow label="OS upgrade" value={osUpgradeText} />
            </StatList>
        </CardShell>
    );
}