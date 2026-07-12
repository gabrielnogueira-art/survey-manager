import { PrismaClient } from "@prisma/client";
import { createSurveyor } from "@/app/actions/teams";

const prisma = new PrismaClient();

export default async function TeamsPage() {
  const surveyors = await prisma.surveyor.findMany();

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Gestão de Equipes</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Formulário */}
        <div className="glass-panel" style={{ height: "fit-content" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Novo Levantador</h2>
          <form action={createSurveyor} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Nome</label>
              <input type="text" name="name" className="input-field" required />
            </div>
            <div>
              <label>E-mail (opcional)</label>
              <input type="email" name="email" className="input-field" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: "1rem", justifyContent: "center" }}>
              Cadastrar Membro
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: "1.5rem" }}>Membros da Equipe</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {surveyors.length === 0 && <p style={{ color: "var(--text-secondary)" }}>Nenhum membro cadastrado.</p>}
            {surveyors.map(surveyor => (
              <div key={surveyor.id} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", border: "1px solid var(--panel-border)" }}>
                <strong>{surveyor.name}</strong>
                {surveyor.email && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{surveyor.email}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
