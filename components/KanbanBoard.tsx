"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { updateAssignmentStatus, createAssignment } from "@/app/actions/assignments";

type Assignment = any;

const COLUMNS = ["Scheduled", "In Progress", "Failed", "Completed"];
const COLUMN_TITLES: Record<string, string> = {
  "Scheduled": "A Fazer",
  "In Progress": "Em Andamento",
  "Failed": "Impedimento",
  "Completed": "Concluído"
};

export default function KanbanBoard({ initialData, units, surveyors }: { initialData: Record<string, Assignment[]>, units: any[], surveyors: any[] }) {
  const [data, setData] = useState(initialData);
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setData(initialData); // Update when new props arrive
  }, [initialData]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = data[source.droppableId];
      const destColumn = data[destination.droppableId];
      const sourceItems = [...sourceColumn];
      const destItems = [...destColumn];
      
      const [removed] = sourceItems.splice(source.index, 1);
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      
      setData({
        ...data,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      });

      await updateAssignmentStatus(removed.id, destination.droppableId);
    } else {
      const column = data[source.droppableId];
      const copiedItems = [...column];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setData({
        ...data,
        [source.droppableId]: copiedItems
      });
    }
  };

  async function handleCreate(formData: FormData) {
    await createAssignment(formData);
    setShowModal(false);
  }

  if (!isMounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Gestão de Tarefas (Kanban)</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nova Tarefa
        </button>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flex: 1, overflowX: "auto", paddingBottom: "1rem" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map(columnId => (
            <div key={columnId} style={{ display: "flex", flexDirection: "column", minWidth: "300px", background: "rgba(0,0,0,0.2)", borderRadius: "0.5rem", padding: "1rem" }}>
              <h3 style={{ marginBottom: "1rem", borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>
                {COLUMN_TITLES[columnId]} ({data[columnId]?.length || 0})
              </h3>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      flex: 1,
                      minHeight: "150px",
                      background: snapshot.isDraggingOver ? "rgba(255,255,255,0.05)" : "transparent",
                      transition: "background 0.2s ease"
                    }}
                  >
                    {data[columnId]?.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: "none",
                              padding: "1rem",
                              margin: "0 0 1rem 0",
                              backgroundColor: "var(--panel-bg)",
                              backdropFilter: "blur(12px)",
                              borderRadius: "0.5rem",
                              border: "1px solid var(--panel-border)",
                              boxShadow: snapshot.isDragging ? "0 5px 15px rgba(0,0,0,0.5)" : "none",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                              {item.unit.propertyName}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                              {new Date(item.date).toLocaleDateString()} - {item.shift}
                            </div>
                            
                            {/* Avatars */}
                            <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
                              {item.surveyors?.map((s: any) => (
                                <div key={s.surveyorId} title={s.surveyor.name} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold" }}>
                                  {s.surveyor.name.substring(0, 2).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: "400px", maxWidth: "90%" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Nova Tarefa</h2>
            <form action={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label>Unidade</label>
                <select name="unitId" className="input-field" required>
                  <option value="">Selecione uma unidade</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.propertyName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Data</label>
                <input type="date" name="date" className="input-field" required />
              </div>
              
              <div>
                <label>Turno</label>
                <select name="shift" className="input-field" required>
                  <option value="Morning">Manhã</option>
                  <option value="Afternoon">Tarde</option>
                </select>
              </div>

              <div>
                <label>Responsável 1</label>
                <select name="surveyorId1" className="input-field">
                  <option value="">Selecione...</option>
                  {surveyors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Responsável 2 (Opcional)</label>
                <select name="surveyorId2" className="input-field">
                  <option value="">Selecione...</option>
                  {surveyors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Criar Tarefa
                </button>
                <button type="button" className="btn-primary" style={{ flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.1)" }} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
