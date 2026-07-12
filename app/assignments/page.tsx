import { PrismaClient } from "@prisma/client";
import KanbanBoard from "@/components/KanbanBoard";

const prisma = new PrismaClient();

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      unit: true,
      surveyors: {
        include: {
          surveyor: true
        }
      }
    }
  });

  const units = await prisma.unit.findMany({
    orderBy: { propertyName: 'asc' }
  });
  
  const surveyors = await prisma.surveyor.findMany({
    orderBy: { name: 'asc' }
  });

  // Prepare standard Kanban columns
  const initialData = {
    "Scheduled": assignments.filter(a => a.status === "Scheduled"),
    "In Progress": assignments.filter(a => a.status === "In Progress"),
    "Failed": assignments.filter(a => a.status === "Failed"),
    "Completed": assignments.filter(a => a.status === "Completed")
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <KanbanBoard initialData={initialData} units={units} surveyors={surveyors} />
    </div>
  );
}
