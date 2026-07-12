"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function submitMeasurement(formData: FormData) {
  const assignmentId = formData.get("assignmentId") as string;
  const unitId = formData.get("unitId") as string;

  const data: Record<string, any> = { assignmentId };
  
  // Parse all float fields
  const fields = [
    "internalAdmin", "internalRestroomAdmin", "internalRestroomPublic",
    "internalIT", "internalCirculation", "internalCarpet", "internalWood",
    "internalCoveredPatio", "internalService", "internalStorage",
    "externalCirculation", "externalParking", "externalDebrisGreen",
    "glassInternalMonthly", "glassExternalMonthly", "glassExternalQuarterly"
  ];

  for (const field of fields) {
    const val = formData.get(field);
    data[field] = val ? parseFloat(val as string) : 0;
  }

  // Create the measurement
  await prisma.measurement.create({
    data: data as any
  });

  // Update assignment and unit status
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: "Completed" }
  });

  await prisma.unit.update({
    where: { id: unitId },
    data: { status: "Completed" }
  });

  revalidatePath("/");
  revalidatePath("/assignments");
  revalidatePath("/units");
  
  redirect("/assignments");
}
