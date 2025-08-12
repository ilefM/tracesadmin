import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import * as XLSX from "xlsx";
import {
  validateExcelCharacterData,
  validateExcelTownData,
  validateHeaders,
} from "../utils";
import type { ICharacterExcel, ITownExcel } from "../interfaces";

export default function AddData() {
  const [selectedType, setSelectedType] = useState("Pionniers");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [insertTownsCount, setInsertedTownsCount] = useState(-1);
  const [skippedTownsUpload, setSkippedTownsUpload] = useState<ITownExcel[]>(
    []
  );
  const [];
  const { user } = useAuth();

  function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedType(event.target.value);
  }

  function downloadExcelTemplate() {
    let url = "/templates/gabarit_pionniers.xlsx";
    if (selectedType === "Communes") {
      url = "/templates/gabarit_communes.xlsx";
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "gabarit.xlsx";
    console.log(link);
    link.click();
  }

  function uploadData(e: React.ChangeEvent<HTMLInputElement>) {
    setError([]);
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = jsonData[0] as string[];
        const { error, type } = validateHeaders(headers);

        if (error) {
          setError([error]);
          return;
        }

        if (type === "communes") {
          console.log("Validating town data...");
          const { parsedRows, rowErrors } = validateExcelTownData(jsonData);
          if (rowErrors.length > 0) {
            setError(rowErrors);
            return;
          }

          if (parsedRows.length === 0) {
            setError(["Aucune donnée valide trouvée dans le fichier."]);
            return;
          }

          const { errors } = await batchUploadTowns(parsedRows);
          if (errors.length > 0) {
            setError(errors);
            return;
          }
        }

        if (type === "pionniers") {
          console.log("Validating character data...");
          const { parsedRows, rowErrors } =
            validateExcelCharacterData(jsonData);
          if (rowErrors.length > 0) {
            setError(rowErrors);
            return;
          }

          if (parsedRows.length === 0) {
            setError(["Aucune donnée valide trouvée dans le fichier."]);
            return;
          }

          const { errors } = await batchUploadCharacters(parsedRows);
          if (errors.length > 0) {
            setError(errors);
            return;
          }
        }

        setSuccess("Données téléversées avec succès !");
      } catch (err) {
        setError([
          "Une erreur est survenue pendant l'importation des données.",
        ]);
      }
    };
  }

  return (
    <div className="flex flex-col">
      <div>
        <h1 className="mb-5 text-lg font-medium">Ajouter des données</h1>
        <div className="flex space-x-5">
          <select
            value={selectedType}
            onChange={handleDropdownChange}
            className="px-4 py-2 rounded border border-gray-300"
          >
            <option value="Communes">Communes</option>
            <option value="Pionniers">Pionniers</option>
          </select>
          <button
            className="bg-gray-300 px-4 py-2 rounded cursor-pointer"
            onClick={downloadExcelTemplate}
          >
            Télécharger le gabarit Excel
          </button>
        </div>
      </div>

      {user && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mt-10">
            <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer">
              Charger un fichier de données Excel
              <input
                id="file"
                type="file"
                accept=".xlsx, .xls"
                onChange={uploadData}
                className="hidden"
              />
            </label>
            {fileName !== "" ? <p>Nom du fichier : {fileName}</p> : ""}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-700">{success}</p>}
        </div>
      )}
    </div>
  );
}
function batchUploadTowns(
  parsedRows: ITownExcel[]
): { errors: any } | PromiseLike<{ errors: any }> {
  throw new Error("Function not implemented.");
}
function batchUploadCharacters(
  parsedRows: ICharacterExcel[]
): { errors: any } | PromiseLike<{ errors: any }> {
  throw new Error("Function not implemented.");
}
