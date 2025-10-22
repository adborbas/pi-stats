import { CardGrid } from "@/components/layout/CardGrid";
import GeneralCard from "@/components/cards/GeneralCard";
import MemoryCard from "@/components/cards/MemoryCard";
import StorageCard from "@/components/cards/StorageCard";
import NetworkCard from "@/components/cards/NetworkCard";
import CpuCard from "@/components/cards/CpuCard";
import SystemHealthCard from "@/components/cards/SystemHealthCard";

export default function Dashboard() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Raspberry Pi</h1>
      <CardGrid>
        <GeneralCard />
        <SystemHealthCard />
        <MemoryCard />
        <CpuCard />
        <StorageCard />
        <NetworkCard />
      </CardGrid>
    </main>
  );
}