import { CardGrid } from "@/components/layout/CardGrid";
import { GeneralCard, SystemHealthCard, MemoryCard, CpuCard, StorageCard, NetworkCard } from "@/components/cards";

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