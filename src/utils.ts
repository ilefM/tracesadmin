import type { ICharacterExcel, ITownExcel } from "./interfaces";
import * as XLSX from "xlsx";

export async function readExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function hasDuplicateInseeCode(towns: ITownExcel[]): boolean {
  const seen = new Set<string>();
  for (const town of towns) {
    if (!town.insee_code) continue; // skip if undefined
    if (seen.has(town.insee_code)) {
      return true; // duplicate found
    }
    seen.add(town.insee_code);
  }
  return false; // all unique
}

export function validateHeaders(headers: string[]): {
  error?: string;
  type?: "communes" | "pionniers";
} {
  const townHeaders = [
    "Nom*",
    "INSEE*",
    "Code postal",
    "Département et code / Province",
    "Description",
    "Position latitude",
    "Position longitude",
  ];

  const charactersHeaders = [
    "Personnage majeur ?",
    "Nom*",
    "Prénom",
    "INSEE",
    "Lieu de naissance",
    "Lieu de décès",
    "Bio",
  ];

  const errorMsg = `Erreur dans les entêtes du fichier (${headers}). Assurez-vous d'utiliser le gabarit excel qu'on fournis.`;

  if (
    headers.length === townHeaders.length &&
    headers.every((h, i) => h === townHeaders[i])
  ) {
    return { type: "communes" };
  }

  if (
    headers.length === charactersHeaders.length &&
    headers.every((h, i) => h === charactersHeaders[i])
  ) {
    return { type: "pionniers" };
  }

  return { error: errorMsg };
}

export function validateExcelTownData(jsonData: any[]) {
  const rowErrors: string[] = [];
  const parsedRows: ITownExcel[] = [];

  jsonData.slice(1).forEach((row, i) => {
    if (row.every((cell: any) => !cell || cell.toString().trim() === "")) {
      return;
    }

    const town: ITownExcel = {
      name: row[0]?.toString().trim(),
      insee_code: row[1]?.toString().trim() || undefined,
      postal_code: row[2]?.toString().trim() || undefined,
      dep_code: row[3]?.toString().trim() || undefined,
      description: row[4]?.toString().trim() || undefined,
      position: [
        row[5]?.toString().trim() || 0,
        row[6]?.toString().trim() || 0,
      ],
    };

    if (!town.name) {
      rowErrors.push(`Ligne ${i + 2}: Le nom de la commune est requis.`);
    }

    if (!town.insee_code) {
      rowErrors.push(`Ligne ${i + 2}: Le code INSEE de la commune est requis.`);
    }

    if (!town.dep_code) {
      rowErrors.push(
        `Ligne ${i + 2}: Le département ou la province est requise.`
      );
    }

    if (town.position && (isNaN(town.position[0]) || isNaN(town.position[1]))) {
      rowErrors.push(
        `Ligne ${i + 2}: Les coordonnées de la commune sont invalides.`
      );
    }

    parsedRows.push(town);
  });

  if (hasDuplicateInseeCode(parsedRows)) {
    rowErrors.push("Le fichier contient des codes INSEE en double.");
  }

  return { parsedRows, rowErrors };
}

export function validateExcelCharacterData(jsonData: any[]) {
  const rowErrors: string[] = [];
  const parsedRows: ICharacterExcel[] = [];

  jsonData.slice(1).forEach((row, i) => {
    if (row.every((cell: any) => !cell || cell.toString().trim() === "")) {
      return;
    }

    let is_main_character = false;
    if (typeof row[0] === "boolean") {
      is_main_character = row[0];
    } else if (row[0] && row[0].toString().trim().toLowerCase() === "true") {
      is_main_character = true;
    } else if (row[0] && row[0].toString().trim().toLowerCase() === "false") {
      is_main_character = false;
    }

    const character: ICharacterExcel = {
      main_character: is_main_character,
      lastname: row[1]?.toString().trim(),
      firstname: row[2]?.toString().trim() || undefined,
      insee_code: row[3]?.toString().trim() || undefined,
      birthplace: row[4]?.toString().trim() || undefined,
      deathplace: row[5]?.toString().trim() || undefined,
      bio: row[6]?.toString().trim() || undefined,
    };

    if (!character.lastname) {
      rowErrors.push(`Ligne ${i + 2}: Le nom du pionnier est requis.`);
    }

    parsedRows.push(character);
  });

  return { parsedRows, rowErrors };
}
