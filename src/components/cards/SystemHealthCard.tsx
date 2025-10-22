"use client";

import { useMemo } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { StatusDot } from "@/components/ui/StatusDot";
import { useHealth } from "@/hooks/useCardData";
import { TwoLineValue } from "@/components/ui/TwoLineValue";

function toneFrom(overall: "ok" | "warn" | "crit"): "good" | "warn" | "bad" {
    return overall === "crit" ? "bad" : overall === "warn" ? "warn" : "good";
}

export default function SystemHealthCard() {
    const { data, error } = useHealth(5 * 60 * 1000);

    const snapshot = useMemo(() => {
        if (!data) return null;
        const bits: string[] = [];
        if (data.reboot.required) bits.push("reboot required");
        if (data.updates.count > 0) bits.push(`${data.updates.count} updates`);
        if (data.failed.count > 0) bits.push(`${data.failed.count} failed service${data.failed.count > 1 ? "s" : ""}`);
        if (data.osUpgrade.available) bits.push("OS upgrade available");

        const rebootText = data.reboot.required
            ? data.reboot.sinceSec != null
                ? `Yes (since ${Math.floor(data.reboot.sinceSec / 86400)}d)`
                : "Yes"
            : "No";

        const updatesText = `${data.updates.count}${data.updates.security > 0 ? ` (${data.updates.security} security)` : ""}`;
        const updatesExamples = data.updates.examples.length > 0 ? `e.g., ${data.updates.examples.slice(0, 4).join(", ")}` : "";

        const failedText = `${data.failed.count}`;
        const failedList = data.failed.services.length > 0
            ? `${data.failed.services.slice(0, 3).join(", ")}${data.failed.services.length > 3 ? ` +${data.failed.services.length - 3}` : ""}`
            : "";

        const osUpgradeText = data.osUpgrade.available ? data.osUpgrade.candidate ?? "Available" : "Up-to-date";

        return {
            overall: data.overall,
            statusLabel: bits.length ? `Health: ${bits.join(", ")}` : "Health: all good",
            rebootText,
            updatesText,
            updatesExamples,
            failedText,
            failedList,
            osUpgradeText,
        };
    }, [data]);

    if (error) return <CardError title="System Health" />;
    if (!snapshot) return <CardLoading title="System Health" />;

    return (
        <CardShell title="System Health" actions={<StatusDot tone={toneFrom(snapshot.overall)} size="sm" title={snapshot.statusLabel} />}>
            <StatList>
                <StatRow label="Reboot required" value={snapshot.rebootText} />
                <StatRow
                    label="Updates"
                    value={
                        snapshot.updatesExamples
                            ? <TwoLineValue primary={snapshot.updatesText} secondary={snapshot.updatesExamples} />
                            : snapshot.updatesText
                    }
                />
                <StatRow
                    label="Failed services"
                    value={
                        snapshot.failedList
                            ? <TwoLineValue primary={snapshot.failedText} secondary={snapshot.failedList} />
                            : snapshot.failedText
                    }
                />
                <StatRow label="OS upgrade" value={snapshot.osUpgradeText} />
            </StatList>
        </CardShell>
    );
}