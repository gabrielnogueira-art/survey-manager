import { PrismaClient } from "@prisma/client";
import { submitMeasurement } from "@/app/actions/measurements";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function MeasurementPage({ params }: { params: { assignmentId: string } }) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    include: { unit: true }
  });

  if (!assignment) {
    notFound();
  }

  const categories = [
    { name: "internalAdmin", label: "Áreas internas - Administrativo" },
    { name: "internalRestroomAdmin", label: "Áreas internas - Sanitários e Vestiários (Admin)" },
    { name: "internalRestroomPublic", label: "Áreas internas - Sanitários (Público)" },
    { name: "internalIT", label: "Áreas internas - Sala de TI" },
    { name: "internalCirculation", label: "Áreas internas - Circulação (corredores, escadas...)" },
    { name: "internalCarpet", label: "Áreas internas - Piso Acarpetado" },
    { name: "internalWood", label: "Áreas internas - Piso de Madeira" },
    { name: "internalCoveredPatio", label: "Áreas internas - Pátios Cobertos" },
    { name: "internalService", label: "Áreas internas - Área de Serviço" },
    { name: "internalStorage", label: "Áreas internas - Almoxarifados e Depósitos" },
    { name: "externalCirculation", label: "Áreas externas - Circulação e Calçadas" },
    { name: "externalParking", label: "Áreas externas - Estacionamento" },
    { name: "externalDebrisGreen", label: "Áreas externas - Áreas Verdes / Detritos" },
    { name: "glassInternalMonthly", label: "Vidros internos - Frequência Mensal" },
    { name: "glassExternalMonthly", label: "Vidros externos - Frequência Mensal" },
    { name: "glassExternalQuarterly", label: "Vidros externos - Frequência Trimestral" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Levantamento de Dados</h1>
        <Link href="/assignments">
          <button className="btn-primary" style={{ background: "transparent", border: "1px solid var(--panel-border)" }}>Voltar</button>
        </Link>
      </div>

      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        <h2>Unidade: {assignment.unit.propertyName}</h2>
        <p style={{ color: "var(--text-secondary)" }}>{assignment.unit.address}</p>
      </div>

      <div className="glass-panel">
        <form action={submitMeasurement} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <input type="hidden" name="unitId" value={assignment.unitId} />

          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--panel-border)", paddingBottom: "1rem" }}>
            <strong style={{ color: "var(--text-secondary)" }}>Descrição da Área</strong>
            <strong style={{ color: "var(--text-secondary)" }}>Área (m²)</strong>
          </div>

          {categories.map((cat, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1rem", alignItems: "center" }}>
              <label>{cat.label}</label>
              <input 
                type="number" 
                step="0.01" 
                name={cat.name} 
                className="input-field" 
                placeholder="0.00"
              />
            </div>
          ))}

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary">
              Salvar Dados e Concluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
