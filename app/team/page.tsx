import { PrismaClient } from "@prisma/client";
import TeamManager from "@/components/TeamManager";

const prisma = new PrismaClient();

export default async function TeamPage() {
  const team = await prisma.surveyor.findMany();

  return (
    <div>
      <h1 style={{ marginBottom: "2rem" }}>Equipe de Levantamento</h1>
      <TeamManager initialTeam={team} />
    </div>
  );
}
