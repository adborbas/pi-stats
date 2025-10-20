import { CardGrid } from "@/components/layout/CardGrid";
import GeneralCard from "@/components/cards/GeneralCard";
import MemoryCard from "@/components/cards/MemoryCard";
import StorageCard from "@/components/cards/StorageCard";
import NetworkCard from "@/components/cards/NetworkCard";

export default function Dashboard() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Raspberry Pi</h1>
      <CardGrid>
        <GeneralCard />
        <MemoryCard />
        <StorageCard />
        <NetworkCard />
      </CardGrid>
    </main>
  );
}