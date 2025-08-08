import { useState } from "react";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthProvider";

export default function Home() {
    const [selectedType, setSelectedType] = useState("Pionniers");
    const [parsedData, setParsedData] = useState<any[]>([]);
    const { user } = useAuth();

    const handleDropdownChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedType(event.target.value);
    };

    function DownloadExcelTemplate() {
        let url = "/templates/gabarit-pionniers.xlsx";
        if (selectedType === "Communes") {
            url = "/templates/gabarit-communes.xlsx";
        }
        const link = document.createElement("a");
        link.href = url;
        link.download = url.split("/").pop() || "gabarit.xlsx";
        console.log(link);
        link.click();
    }

    function uploadData(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
            });

            console.log("Parsed Excel Data:", jsonData);
            setParsedData(jsonData);

            // Optional: Different handling based on selectedType
            if (selectedType === "Communes") {
                // parse as town data
            } else {
                // parse as character data
            }
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <div className="space-y-10">
            <DataTable />
            <SearchBar />
            <div>
                <h1 className="mb-5 text-lg font-medium">
                    Ajouter des données
                </h1>
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
                        onClick={DownloadExcelTemplate}
                    >
                        Télécharger le gabarit Excel
                    </button>
                    {user && (
                        <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer">
                            Charger un tableau Excel de données
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={uploadData}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
