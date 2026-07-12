"use client";

import { useState } from "react";
import { createSurveyor, updateSurveyor, deleteSurveyor } from "@/app/actions/surveyors";

type Surveyor = {
  id: string;
  name: string;
  email: string | null;
};

export default function TeamManager({ initialTeam }: { initialTeam: Surveyor[] }) {
  const [editing, setEditing] = useState<Surveyor | null>(null);

  async function handleCreate(formData: FormData) {
    await createSurveyor(formData);
    // As Server Action revalidates, the page will refresh with new data
  }

  async function handleUpdate(formData: FormData) {
    if (editing) {
      await updateSurveyor(editing.id, formData);
      setEditing(null);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja remover este membro da equipe?")) {
      await deleteSurveyor(id);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
      
      {/* Formulário de Criação / Edição */}
      <div className="glass-panel" style={{ height: "fit-content" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>
          {editing ? "Editar Membro" : "Novo Membro"}
        </h2>
        
        <form action={editing ? handleUpdate : handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label>Nome</label>
            <input 
              type="text" 
              name="name" 
              className="input-field" 
              defaultValue={editing ? editing.name : ""} 
              required 
            />
          </div>
          <div>
            <label>Email (Opcional)</label>
            <input 
              type="email" 
              name="email" 
              className="input-field" 
              defaultValue={editing && editing.email ? editing.email : ""} 
            />
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              {editing ? "Salvar" : "Adicionar"}
            </button>
            {editing && (
              <button 
                type="button" 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.1)" }}
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista da Equipe */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1.5rem" }}>Membros Cadastrados</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {initialTeam.length === 0 && <p style={{ color: "var(--text-secondary)" }}>Nenhum membro cadastrado.</p>}
          
          {initialTeam.map(member => (
            <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", border: "1px solid var(--panel-border)" }}>
              <div>
                <strong>{member.name}</strong>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {member.email || "Sem e-mail"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  onClick={() => setEditing(member)} 
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline" }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(member.id)} 
                  style={{ background: "transparent", border: "none", color: "#ff4a4a", cursor: "pointer", textDecoration: "underline" }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
