import type { ICharacterExcel, ITownExcel } from "./interfaces";

export function validateHeaders(headers: string[]): {
  error?: string;
  type?: "communes" | "pionniers";
} {
  const townHeaders = [
    "Nom*",
    "Code INSEE*",
    "Code postal",
    "Département et code",
    "Description",
    "Position latitude",
    "Position longitude",
  ];

  const charactersHeaders = [
    "Nom*",
    "Prénom",
    "Code INSEE",
    "Lieu de naissance",
    "Lieu de décès",
    "Bio",
  ];

  const errorMsg = `Erreur dans les entêtes du fichier ( ${headers} ). Assurez-vous d'utiliser le gabarit excel qu'on fournis.`;

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

    if (town.position && (isNaN(town.position[0]) || isNaN(town.position[1]))) {
      rowErrors.push(
        `Ligne ${i + 2}: Les coordonnées de la commune sont invalides.`
      );
    }

    parsedRows.push(town);
  });

  return { parsedRows, rowErrors };
}

export function validateExcelCharacterData(jsonData: any[]) {
  const rowErrors: string[] = [];
  const parsedRows: ICharacterExcel[] = [];

  jsonData.slice(1).forEach((row, i) => {
    if (row.every((cell: any) => !cell || cell.toString().trim() === "")) {
      return;
    }

    const character: ICharacterExcel = {
      lastname: row[0]?.toString().trim(),
      firstname: row[1]?.toString().trim() || undefined,
      insee_code: row[2]?.toString().trim() || undefined,
      birthplace: row[3]?.toString().trim() || undefined,
      deathplace: row[4]?.toString().trim() || undefined,
      bio: row[5]?.toString().trim() || undefined,
    };

    if (!character.lastname) {
      rowErrors.push(`Ligne ${i + 2}: Le nom du pionnier est requis.`);
    }

    if (!character.insee_code) {
      rowErrors.push(`Ligne ${i + 2}: Le code INSEE du pionnier est requis.`);
    }

    parsedRows.push(character);
  });

  return { parsedRows, rowErrors };
}
