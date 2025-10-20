"use client";
import { CardShell } from "./CardShell";
export const CardLoading = ({ title }: { title: string }) =>
  <CardShell title={title}><div className="text-sm text-muted-foreground">Loading…</div></CardShell>;

export const CardError = ({ title }: { title: string }) =>
  <CardShell title={title}><div className="text-sm text-red-500">Failed to load</div></CardShell>;