import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

import {
  readExcelFile,
  validateExcelCharacterData,
  validateExcelTownData,
  validateHeaders,
} from "../utils";
import type { ICharacterExcel, ITownExcel } from "../interfaces";
import { batchInsertCharacters, batchInsertTowns } from "../supabase/api";
import { data } from "react-router";

export default function AddData() {
  const [selectedType, setSelectedType] = useState("Pionniers");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insertedTownsCount, setInsertedTownsCount] = useState(-1);
  const [skippedTownsUpload, setSkippedTownsUpload] = useState<ITownExcel[]>(
    []
  );
  const [insertedCharactersCount, setInsertedCharactersCount] = useState(-1);
  const [skippedCharactersUpload, setSkippedCharactersUpload] = useState<
    ICharacterExcel[]
  >([]);
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
    link.click();
  }

  async function uploadData(e: React.ChangeEvent<HTMLInputElement>) {
    setSuccess("");
    setError([]);

    setInsertedTownsCount(-1);
    setSkippedTownsUpload([]);

    setInsertedCharactersCount(-1);
    setSkippedCharactersUpload([]);

    setIsLoading(true);

    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    let jsonData: any[] = [];
    try {
      jsonData = await readExcelFile(file);
    } catch {
      setError([
        "Une erreur est survenue pendant la lecture des données du fichier.",
      ]);
      setIsLoading(false);
      return;
    }

    if (jsonData.length === 0) {
      setError(["Le fichier Excel est vide."]);
      setIsLoading(false);
      return;
    }

    const headers = jsonData[0] as string[];
    const { error: headerError, type: dataTypeFromHeaders } =
      validateHeaders(headers);

    if (headerError) {
      setError([headerError]);
      setIsLoading(false);
      return;
    }

    const dataType = dataTypeFromHeaders || selectedType.toLowerCase();

    try {
      if (dataType === "communes") {
        const { parsedRows, rowErrors } = validateExcelTownData(jsonData);
        if (rowErrors.length > 0) {
          setError(rowErrors);
          setIsLoading(false);
          return;
        } else {
          setSuccess("Les données sont dans le bon format !");
        }

        if (parsedRows.length === 0) {
          setError(["Aucune donnée valide trouvée dans le fichier."]);
          setIsLoading(false);
          return;
        }

        const { insertedTowns, skippedTowns, errorsTowns } =
          await batchInsertTowns(parsedRows);
        if (errorsTowns.length > 0) {
          setError((prev) => [
            ...prev,
            "Quelques erreurs sont survenues pendant l'importation des communes.",
            ...errorsTowns,
          ]);
          setIsLoading(false);
          return;
        }

        if (insertedTowns > 0) {
          setInsertedTownsCount(insertedTowns);
          setSkippedTownsUpload(skippedTowns);
        } else {
          setError(["Aucune nouvelle commune n'a été insérée."]);
          setIsLoading(false);
          return;
        }
      }

      if (dataType === "pionniers") {
        const { parsedRows, rowErrors } = validateExcelCharacterData(jsonData);
        if (rowErrors.length > 0) {
          setError(rowErrors);
          setIsLoading(false);
          return;
        } else {
          setSuccess("Les données sont dans le bon format !");
        }

        if (parsedRows.length === 0) {
          setError(["Aucune donnée valide trouvée dans le fichier."]);
          setIsLoading(false);
          return;
        }

        const {
          insertedCharactersNumber,
          skippedCharacters,
          errorsCharacters,
        } = await batchInsertCharacters(parsedRows);
        if (errorsCharacters.length > 0) {
          setError((prev) => [
            ...prev,
            "Quelques erreurs sont survenues pendant l'importation des pionniers.",
            ...errorsCharacters,
          ]);
          setIsLoading(false);
          return;
        }

        if (insertedCharactersNumber > 0) {
          setInsertedCharactersCount(insertedCharactersNumber);
          setSkippedCharactersUpload(skippedCharacters);
        } else {
          setError(["Aucun nouveau pionnier n'a été inséré."]);
          setIsLoading(false);
          return;
        }
      }
      setSuccess("Importation des données réussie !");
    } catch (err) {
      setError(["Une erreur est survenue pendant l'ajout de données"]);
    }
    setIsLoading(false);
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
          <div className="mt-5 text-lg space-y-2">
            {isLoading && <p className="mt-5">Importation en cours...</p>}
            {error && <p className="text-red-500">{error.join(" ")}</p>}
            {success && <p className="text-green-700">{success}</p>}
            {insertedTownsCount !== -1 && (
              <div className="mt-5">
                <p className="text-green-700">
                  Villes/Communes ajoutées: {insertedTownsCount}
                </p>
                {skippedTownsUpload.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">
                      Villes/communes ignorées (déjà existantes):
                    </p>
                    <ul className="list-disc list-inside">
                      {skippedTownsUpload.map((town, i) => (
                        <li key={i}>
                          {town.name} (Code INSEE: {town.insee_code})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {insertedCharactersCount !== -1 && (
              <div className="mt-5">
                <p className="text-green-700">
                  Pionniers ajoutés: {insertedCharactersCount}
                </p>
                {skippedCharactersUpload.length > 0 && (
                  <div className="mt-3">
                    <p>Pionniers ignorés (mauvais code INSEE associé):</p>
                    <ul className="list-disc list-inside">
                      {skippedCharactersUpload.map((char, i) => (
                        <li key={i}>
                          {char.firstname} {char.lastname} (Code INSEE:{" "}
                          {char.insee_code})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
