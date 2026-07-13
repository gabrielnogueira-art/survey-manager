"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function updateAssignmentStatus(assignmentId: string, newStatus: string) {
  try {
    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: newStatus },
      include: { unit: true }
    });

    // Sync Unit status as requested
    let unitStatus = assignment.unit.status;
    if (newStatus === "Scheduled") unitStatus = "Pending";
    if (newStatus === "In Progress") unitStatus = "In Progress";
    if (newStatus === "Failed") unitStatus = "Issue";
    if (newStatus === "Review") unitStatus = "Review";
    if (newStatus === "Completed") unitStatus = "Completed";

    await prisma.unit.update({
      where: { id: assignment.unitId },
      data: { status: unitStatus }
    });

    // Enviar e-mail de notificação de alteração de status
    const surveyors = await prisma.assignmentSurveyor.findMany({
      where: { assignmentId },
      include: { surveyor: true }
    });

    for (const s of surveyors) {
      if (s.surveyor.email) {
        await sendEmail({
          to: s.surveyor.email,
          subject: `Status da Tarefa Atualizado: ${assignment.unit.propertyName}`,
          html: `<p>Olá ${s.surveyor.name},</p><p>O status da tarefa no imóvel <strong>${assignment.unit.propertyName}</strong> foi alterado para: <strong>${newStatus}</strong>.</p><p>Acesse o painel para mais detalhes.</p>`
        });
      }
    }

    revalidatePath("/assignments");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAssignment(formData: FormData) {
  const unitId = formData.get("unitId") as string;
  const surveyorId1 = formData.get("surveyorId1") as string;
  const surveyorId2 = formData.get("surveyorId2") as string;
  const date = formData.get("date") as string;
  const shift = formData.get("shift") as string;
  
  try {
    const assignment = await prisma.assignment.create({
      data: {
        unitId,
        date: new Date(date),
        shift,
        status: "Scheduled"
      }
    });

    const surveyorsToConnect = [];
    if (surveyorId1) surveyorsToConnect.push({ assignmentId: assignment.id, surveyorId: surveyorId1 });
    if (surveyorId2 && surveyorId2 !== surveyorId1) surveyorsToConnect.push({ assignmentId: assignment.id, surveyorId: surveyorId2 });

    if (surveyorsToConnect.length > 0) {
      await prisma.assignmentSurveyor.createMany({
        data: surveyorsToConnect
      });
      
      // Notificar novos responsáveis
      for (const stc of surveyorsToConnect) {
        const surveyor = await prisma.surveyor.findUnique({ where: { id: stc.surveyorId } });
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        if (surveyor && surveyor.email && unit) {
          await sendEmail({
            to: surveyor.email,
            subject: `Nova Tarefa Atribuída: ${unit.propertyName}`,
            html: `<p>Olá ${surveyor.name},</p><p>Você recebeu uma nova tarefa para realizar um levantamento no imóvel: <strong>${unit.propertyName}</strong>.</p><p><strong>Data:</strong> ${date}</p><p><strong>Turno:</strong> ${shift}</p><p>Acesse o painel para verificar os detalhes!</p>`
          });
        }
      }
    }

    revalidatePath("/assignments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAssignmentDetails(assignmentId: string, formData: FormData) {
  const date = formData.get("date") as string;
  const shift = formData.get("shift") as string;
  const surveyorId1 = formData.get("surveyorId1") as string;
  const surveyorId2 = formData.get("surveyorId2") as string;

  try {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        date: new Date(date),
        shift
      }
    });

    // Clear old surveyors
    await prisma.assignmentSurveyor.deleteMany({
      where: { assignmentId }
    });

    const surveyorsToConnect = [];
    if (surveyorId1) surveyorsToConnect.push({ assignmentId, surveyorId: surveyorId1 });
    if (surveyorId2 && surveyorId2 !== surveyorId1) surveyorsToConnect.push({ assignmentId, surveyorId: surveyorId2 });

    if (surveyorsToConnect.length > 0) {
      await prisma.assignmentSurveyor.createMany({
        data: surveyorsToConnect
      });
    }

    revalidatePath("/assignments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
