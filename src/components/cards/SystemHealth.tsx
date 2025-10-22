"use client";

import useSWR from "swr";
import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { StatusDot } from "@/components/ui/StatusDot";

type HealthLevel = "ok" | "warn" | "crit";

type HealthSummary = {
    overall: HealthLevel;
    rebootRequired: boolean;
    updates: number;
    failedServices: number;
    osUpgrade: {
        available: boolean;
        currentMajor?: number | null;
        candidateMajor?: number | null;
        current?: string | null;
        candidate?: string | null;
    };
    updatedAt: number;
};

type HealthDetails = {
    reboot: { required: boolean; sinceSec?: number | null };
    updates: { count: number; security: number; examples: string[] };
    failed: { count: number; services: string[] };
    osUpgrade: {
        available: boolean;
        current: string | null;
        candidate: string | null;
        currentMajor: number | null;
        candidateMajor: number | null;
    };
    overall: HealthLevel;
    updatedAt: number;
};

const fetcher = (u: string) => fetch(u, { cache: "no-store" }).then((r) => r.json());

export default function SystemHealthCard() {
    // Always call hooks first (no early returns before hooks)
    const { data: summary, error: sumErr } = useSWR<HealthSummary>("/api/health/summary", fetcher, {
        refreshInterval: 300_000, // 5 min
        revalidateOnFocus: false,
    });
    const { data: details, error: detErr } = useSWR<HealthDetails>("/api/health/details", fetcher, {
        refreshInterval: 300_000,
        revalidateOnFocus: false,
    });

    // Status badge tone + label
    const tone: "good" | "warn" | "bad" | "neutral" =
        !summary ? "neutral" : summary.overall === "crit" ? "bad" : summary.overall === "warn" ? "warn" : "good";

    const statusLabel = (() => {
        if (!summary) return "Health status";
        const bits: string[] = [];
        if (summary.rebootRequired) bits.push("reboot required");
        if (summary.updates > 0) bits.push(`${summary.updates} updates`);
        if (summary.failedServices > 0)
            bits.push(`${summary.failedServices} failed service${summary.failedServices > 1 ? "s" : ""}`);
        if (summary.osUpgrade?.available) bits.push("OS upgrade available");
        return bits.length ? `Health: ${bits.join(", ")}` : "Health: all good";
    })();

    // Loading / error states
    if (sumErr || detErr) return <CardError title="System Health" />;
    if (!summary || !details) return <CardLoading title="System Health" />;

    // Helpers
    const rebootText = details.reboot?.required
        ? details.reboot?.sinceSec != null
            ? `Yes (since ${Math.floor((details.reboot.sinceSec as number) / 86400)}d)`
            : "Yes"
        : "No";

    const updatesText =
        (details.updates?.count ?? 0) +
        ((details.updates?.security ?? 0) > 0 ? ` (${details.updates.security} security)` : "");

    const updatesExamples =
        details.updates?.examples && details.updates.examples.length > 0
            ? `e.g., ${details.updates.examples.slice(0, 4).join(", ")}`
            : "";

    const failedText = `${details.failed?.count ?? 0}`;
    const failedList =
        details.failed?.services && details.failed.services.length > 0
            ? `${details.failed.services.slice(0, 3).join(", ")}${details.failed.services.length > 3 ? ` +${details.failed.services.length - 3}` : ""
            }`
            : "";

    const osUpgradeText = details.osUpgrade?.available
        ? details.osUpgrade.candidate ?? "Available"
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