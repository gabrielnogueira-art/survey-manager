import { PrismaClient } from "@prisma/client";
import MapWrapper from "@/components/MapWrapper";

const prisma = new PrismaClient();

export default async function Dashboard() {
  const units = await prisma.unit.findMany();
  
  const pendingCount = units.filter(u => u.status === "Pending").length;
  const progressCount = units.filter(u => u.status === "In Progress").length;
  const completedCount = units.filter(u => u.status === "Completed").length;

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Dashboard Geral</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="glass-panel">
          <h3>Pendentes</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--warning)" }}>{pendingCount}</p>
        </div>
        <div className="glass-panel">
          <h3>Em Andamento</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent)" }}>{progressCount}</p>
        </div>
        <div className="glass-panel">
          <h3>Concluídos</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success)" }}>{completedCount}</p>
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: "1rem" }}>Mapa de Unidades</h2>
        <MapWrapper units={units} />
      </div>
    </div>
  );
}
