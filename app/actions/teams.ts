"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createSurveyor(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  await prisma.surveyor.create({
    data: {
      name,
      email: email || null
    }
  });

  revalidatePath("/teams");
}
