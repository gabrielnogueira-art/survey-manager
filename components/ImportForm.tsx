"use client";

import { useState } from "react";
import { importUnits } from "@/app/actions/importUnits";

export default function ImportForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAction(formData: FormData) {
    setLoading(true);
    setMessage("");
    try {
      const res = await importUnits(formData);
      if (res.success) {
        setMessage(`Sucesso! ${res.count} unidades importadas.`);
      } else {
        setMessage(`Erro: ${res.error}`);
      }
    } catch (err: any) {
      setMessage(`Erro inesperado: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="glass-panel" style={{ height: "fit-content", marginTop: "1rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Importar em Lote</h2>
      <form action={handleAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label>Planilha (Excel/CSV) ou PDF</label>
          <input 
            type="file" 
            name="file" 
            accept=".xlsx,.csv,.pdf" 
            className="input-field" 
            required 
            style={{ padding: "0.5rem" }} 
          />
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          A planilha deve ter colunas: Secretaria, ID da Unidade, Nome, Endereço. 
          As coordenadas serão geradas automaticamente pelo endereço.
        </p>
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.5rem", justifyContent: "center" }}>
          {loading ? "Importando (Geocodificando aguarde)..." : "Importar Arquivo"}
        </button>
        {message && (
          <p style={{ marginTop: "1rem", color: message.startsWith("Erro") ? "#ff4a4a" : "#4ade80" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
