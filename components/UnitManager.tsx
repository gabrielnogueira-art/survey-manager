"use client";

import { useState } from "react";
import { createUnit, updateUnit } from "@/app/actions/units";
import ImportForm from "@/components/ImportForm";

type Unit = any;

export default function UnitManager({ initialUnits }: { initialUnits: Unit[] }) {
  const [editing, setEditing] = useState<Unit | null>(null);

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateUnit(editing.id, formData);
      setEditing(null);
    } else {
      await createUnit(formData);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Formulário de Cadastro e Edição */}
        <div className="glass-panel" style={{ height: "fit-content" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>
            {editing ? "Editar Unidade" : "Nova Unidade"}
          </h2>
          <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label>Secretaria</label>
              <input type="text" name="department" className="input-field" defaultValue={editing?.department || ""} required />
            </div>
            <div>
              <label>ID da Unidade</label>
              <input type="text" name="unitId" className="input-field" defaultValue={editing?.unitId || ""} required />
            </div>
            <div>
              <label>Nome do Imóvel</label>
              <input type="text" name="propertyName" className="input-field" defaultValue={editing?.propertyName || ""} required />
            </div>
            <div>
              <label>Endereço Completo</label>
              <input type="text" name="address" className="input-field" defaultValue={editing?.address || ""} required />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label>Latitude</label>
                <input type="number" step="any" name="lat" className="input-field" defaultValue={editing?.lat || ""} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Longitude</label>
                <input type="number" step="any" name="lng" className="input-field" defaultValue={editing?.lng || ""} required />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                {editing ? "Salvar Alterações" : "Cadastrar Unidade"}
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
        
        <ImportForm />
      </div>

      {/* Lista de Unidades */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1.5rem" }}>Unidades Cadastradas</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {initialUnits.length === 0 && <p style={{ color: "var(--text-secondary)" }}>Nenhuma unidade cadastrada.</p>}
          {initialUnits.map(unit => (
            <div key={unit.id} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", border: "1px solid var(--panel-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{unit.propertyName}</strong>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span className={`badge ${unit.status.toLowerCase().replace(" ", "-")}`}>{unit.status}</span>
                  <button 
                    onClick={() => setEditing(unit)}
                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Editar
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                {unit.department} - {unit.address}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
