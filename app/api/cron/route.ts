import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Only fetch scheduled or in progress tasks
    const assignments = await prisma.assignment.findMany({
      where: {
        status: { in: ["Scheduled", "In Progress"] },
      },
      include: {
        unit: true,
        surveyors: {
          include: { surveyor: true }
        }
      }
    });

    const now = new Date();
    // Start of today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let emailsSent = 0;

    for (const a of assignments) {
      const taskDate = new Date(a.date);
      // Strip time from taskDate for comparison
      const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

      // If task is exactly tomorrow
      if (taskDay.getTime() === tomorrow.getTime()) {
        for (const s of a.surveyors) {
          if (s.surveyor.email) {
            await sendEmail({
              to: s.surveyor.email,
              subject: `Lembrete de Prazo: Levantamento Amanhã`,
              html: `<p>Olá ${s.surveyor.name},</p>
                     <p>Lembrete automático: A tarefa para realizar o levantamento no imóvel <strong>${a.unit.propertyName}</strong> está agendada para <strong>amanhã</strong> (Turno: ${a.shift}).</p>
                     <p>Prepare os equipamentos e acesse o painel para revisar os detalhes.</p>`
            });
            emailsSent++;
          }
        }
      }
      
      // If task is TODAY or LATE
      if (taskDay.getTime() <= today.getTime()) {
        for (const s of a.surveyors) {
          if (s.surveyor.email) {
            await sendEmail({
              to: s.surveyor.email,
              subject: `Atenção: Prazo de Tarefa Hoje/Atrasado`,
              html: `<p>Olá ${s.surveyor.name},</p>
                     <p>A tarefa para o imóvel <strong>${a.unit.propertyName}</strong> está marcada para hoje ou já está atrasada!</p>
                     <p>Por favor, atualize o status do levantamento no Kanban assim que possível.</p>`
            });
            emailsSent++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: `Cron executado. ${emailsSent} alertas de vencimento enviados.` });

  } catch (error: any) {
    console.error("Cron falhou:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
