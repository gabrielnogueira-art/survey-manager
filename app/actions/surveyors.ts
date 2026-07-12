"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createSurveyor(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  
  if (!name) return { success: false, error: "Nome é obrigatório" };
  
  try {
    await prisma.surveyor.create({
      data: { name, email }
    });
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSurveyor(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  
  if (!name) return { success: false, error: "Nome é obrigatório" };
  
  try {
    await prisma.surveyor.update({
      where: { id },
      data: { name, email }
    });
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSurveyor(id: string) {
  try {
    await prisma.surveyor.delete({ where: { id } });
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
