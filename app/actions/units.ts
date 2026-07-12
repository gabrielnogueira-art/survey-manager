"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createUnit(formData: FormData) {
  const department = formData.get("department") as string;
  const unitId = formData.get("unitId") as string;
  const propertyName = formData.get("propertyName") as string;
  const address = formData.get("address") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);

  await prisma.unit.create({
    data: {
      department,
      unitId,
      propertyName,
      address,
      lat,
      lng,
      status: "Pending"
    }
  });

  revalidatePath("/");
  revalidatePath("/units");
}

export async function updateUnit(id: string, formData: FormData) {
  const department = formData.get("department") as string;
  const unitId = formData.get("unitId") as string;
  const propertyName = formData.get("propertyName") as string;
  const address = formData.get("address") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);

  await prisma.unit.update({
    where: { id },
    data: {
      department,
      unitId,
      propertyName,
      address,
      lat,
      lng
    }
  });

  revalidatePath("/");
  revalidatePath("/units");
}

