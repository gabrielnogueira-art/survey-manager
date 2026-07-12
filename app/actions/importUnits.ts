"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import * as xlsx from "xlsx";

const prisma = new PrismaClient();

async function geocodeAddress(address: string): Promise<{lat: number, lng: number}> {
  try {
    // Basic geocoding via Nominatim
    // Add a delay if processing many to avoid rate limits (simplified here)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: { "User-Agent": "SurveyManagerApp/1.0" }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Geocoding failed for", address);
  }
  // Default to São Paulo center if not found
  return { lat: -23.5505, lng: -46.6333 };
}

export async function importUnits(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "Nenhum arquivo enviado." };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  let parsedUnits: any[] = [];

  try {
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Expected columns based on the image: Secretaria, Unidade, Nome do Imóvel, Endereço
      const rows = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
      
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue; // Skip empty rows

        parsedUnits.push({
          department: String(row[0] || ""),
          unitId: String(row[1] || ""),
          propertyName: String(row[2] || ""),
          address: String(row[3] || row[2] || "Endereço não informado"), // Fallback to property name if no address col
        });
      }
    } else if (file.name.endsWith(".pdf")) {
      // Polyfill para evitar o erro DOMMatrix no backend do Node/Next.js
      if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
        (global as any).DOMMatrix = class DOMMatrix {};
      }
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      const lines = data.text.split("\n").filter(l => l.trim().length > 0);
      
      // Heuristic parsing for PDF (Very basic, assumes 1 unit per line or specific format)
      for (const line of lines) {
        // Just an example heuristic: try to extract a unit if line is long enough
        if (line.length > 15 && !line.toLowerCase().includes("secretaria")) {
          parsedUnits.push({
            department: "Importado via PDF",
            unitId: "PDF-" + Math.floor(Math.random() * 10000),
            propertyName: line.substring(0, 50), // First 50 chars as name
            address: line, // Use full line as address for geocoding
          });
        }
      }
    } else {
      return { success: false, error: "Formato de arquivo não suportado." };
    }

    // Insert to DB
    let importedCount = 0;
    for (const u of parsedUnits) {
      if (!u.propertyName) continue;
      
      const { lat, lng } = await geocodeAddress(u.address);
      
      await prisma.unit.create({
        data: {
          department: u.department,
          unitId: u.unitId,
          propertyName: u.propertyName,
          address: u.address,
          lat,
          lng,
          status: "Pending"
        }
      });
      importedCount++;
      
      // Small delay to respect Nominatim rate limits (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    revalidatePath("/");
    revalidatePath("/units");
    
    return { success: true, count: importedCount };
    
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
