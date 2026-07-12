"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
    if (newStatus === "Completed") unitStatus = "Completed";
    if (newStatus === "Failed") unitStatus = "Issue";

    await prisma.unit.update({
      where: { id: assignment.unitId },
      data: { status: unitStatus }
    });

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
    }

    revalidatePath("/assignments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
