import type { ICharacter, ITown } from "./interfaces";

export function exportToCSV(data: (ITown | ICharacter)[]) {
  if (data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const escaped = ("" + row[fieldName]).replace(/"/g, '""');
          return `"${escaped}"`; // wrap fields in quotes
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
