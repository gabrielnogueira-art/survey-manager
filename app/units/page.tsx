import { PrismaClient } from "@prisma/client";
import UnitManager from "@/components/UnitManager";

const prisma = new PrismaClient();

export default async function UnitsPage() {
  const units = await prisma.unit.findMany();

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Gestão de Unidades</h1>
      <UnitManager initialUnits={units} />
    </div>
  );
}
