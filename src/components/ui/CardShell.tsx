"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

export type CardShellProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CardShell({ title, actions, children, className }: CardShellProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {actions ? <div className="ml-3">{actions}</div> : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}