import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import type { ICharacter, ITown } from "../interfaces";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router";

export default function DataTable() {
  const [view, setView] = useState<"towns" | "characters">("characters");
  const [townsData, setTownsData] = useState<ITown[]>([]);
  const [charactersData, setCharactersData] = useState<ICharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [townFilterInput, setTownFilterInput] = useState("");
  const [depFilterInput, setDepFilterInput] = useState("");
  const [appliedTownFilter, setAppliedTownFilter] = useState("");
  const [appliedDepFilter, setAppliedDepFilter] = useState("");

  const navigate = useNavigate();
  const pageSize = 10;
  const data = view === "towns" ? townsData : charactersData;
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  useEffect(() => {
    const fetchAllRows = async () => {
      setIsLoading(true);

      const allRows: (ITown | ICharacter)[] = [];
      const pageSize = 100;
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        if (view === "characters" && appliedTownFilter === "lieu=aucun") {
          const { data, error } = await supabase
            .from("characters")
            .select("*")
            .is("town_id", null)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) {
            console.error("Error fetching data:", error.message);
            break;
          }

          if (data && data.length > 0) {
            allRows.push(...data);
            page++;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        } else {
          let query =
            view === "towns"
              ? supabase
                  .from("towns")
                  .select("*")
                  .range(page * pageSize, (page + 1) * pageSize - 1)
              : supabase
                  .from("characters")
                  .select("*, towns!inner(dep_code, name)")
                  .range(page * pageSize, (page + 1) * pageSize - 1);

          if (appliedDepFilter) {
            if (view === "towns") {
              query = query.ilike("dep_code", `%${appliedDepFilter}%`);
            } else {
              query = query.ilike("towns.dep_code", `%${appliedDepFilter}%`);
            }
          }

          if (view === "characters" && appliedTownFilter) {
            query = query.ilike("towns.name", `%${appliedTownFilter}%`);
          }
          console.log("depfilter", depFilterInput);
          const { data, error } = await query;

          if (error) {
            console.error("Error fetching data:", error.message);
            break;
          }

          if (data && data.length > 0) {
            allRows.push(...data);
            page++;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }
      }

      if (view === "towns") {
        setTownsData(allRows as ITown[]);
      } else {
        setCharactersData(allRows as ICharacter[]);
      }

      setPage(1);
      setIsLoading(false);
    };

    fetchAllRows();
  }, [view, appliedDepFilter, appliedTownFilter]);

  const toggleView = () => {
    setAppliedDepFilter("");
    setAppliedTownFilter("");
    setPage(1);
    setView((prev) => (prev === "towns" ? "characters" : "towns"));
  };

  function handleSuggestionClick(item: {
    id: string;
    type: "town" | "character";
  }) {
    if (item.type === "town") {
      navigate(`/commune-details/${item.id}`);
    } else {
      navigate(`/pionnier-details/${item.id}`);
    }
  }

  function handleExport() {
    const exportData = data.map((item: any) => {
      if (view === "towns") {
        return {
          "Nom de la commune": item.name,
          "Code INSEE": item.insee_code,
          "Code postal": item.postal_code,
          Département: item.dep_code,
          "Position géographique": item.position,
          Déscription: item.description,
        };
      } else {
        return {
          Prénom: item.firstname,
          Nom: item.lastname,
          "Lieu de naissance": item.birthplace,
          "Lieu de décès": item.deathplace,
          Commune: item.towns?.name || "",
          Département: item.dep_code || "",
          bio: item.bio,
        };
      }
    });

    const name = view === "characters" ? "pionniers" : "communes";

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    XLSX.writeFile(workbook, `donnees_${name}.csv`, { bookType: "csv" });
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">
          Liste de {view === "towns" ? "communes" : "pionniers"}
        </h1>
        <button
          onClick={toggleView}
          className="bg-[#6096ba] text-white px-4 py-2 rounded hover:bg-[#446a83] cursor-pointer"
        >
          Voir {view === "towns" ? "pionniers" : "communes/villes"}
        </button>
      </div>

      <div className="my-5">
        <h1 className="text-lg font-semibold mb-2">Filtres</h1>
        {view === "characters" ? (
          <div className="w-full flex space-x-7 items-end">
            <div className="flex flex-col space-y-2">
              <label htmlFor="townInput">Nom de commune/ville</label>
              <input
                id="townInput"
                type="text"
                placeholder="Nom de la commune"
                className="border border-gray-400 w-[350px] p-2 rounded"
                value={townFilterInput}
                onChange={(e) => setTownFilterInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="departmentInput">
                Nom/numéro du département ou nom de la province
              </label>
              <input
                id="departmentInput"
                type="text"
                placeholder="Nom/numéro du département"
                className="border border-gray-400 w-[350px] p-2 rounded"
                value={depFilterInput}
                onChange={(e) => setDepFilterInput(e.target.value)}
              />
            </div>

            <div>
              <button
                onClick={() => {
                  setAppliedTownFilter(townFilterInput);
                  setAppliedDepFilter(depFilterInput);
                  setPage(1);
                }}
                className="bg-[#6096ba] cursor-pointer disabled:cursor-auto disabled:bg-gray-200 text-white px-4 py-2 rounded hover:bg-[#446a83]"
                disabled={isLoading}
              >
                Appliquer
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex space-x-7 items-end">
            <div className="flex flex-col space-y-2">
              <label htmlFor="departmentInput">Nom/numéro du département</label>
              <input
                id="departmentInput"
                type="text"
                placeholder="Nom/numéro du département"
                className="border border-gray-400 w-[350px] p-2 rounded"
                value={depFilterInput}
                onChange={(e) => setDepFilterInput(e.target.value)}
              />
            </div>

            <div>
              <button
                onClick={() => {
                  setAppliedDepFilter(depFilterInput);
                  setPage(1);
                }}
                className="bg-[#6096ba] cursor-pointer text-white disabled:bg-gray-200 px-4 py-2 rounded hover:bg-[#446a83]"
                disabled={isLoading}
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
      >
        Exporter en Excel
      </button>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          <div className="mb-2">
            {view === "towns" ? (
              <div className="grid grid-cols-4 gap-4 font-bold px-4">
                <p>Nom</p>
                <p>Code INSEE</p>
                <p>Code postal</p>
                <p>Département</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 font-medium px-4">
                <p>Nom</p>
                <p>Commune/ville</p>
                <p>Département</p>
              </div>
            )}
          </div>

          <ul className="space-y-2">
            {paginatedData.map((item: any) =>
              view === "towns" ? (
                <li
                  key={item.id}
                  className="grid grid-cols-4 gap-4 p-4 rounded bg-[#eeeeee]"
                  onClick={() =>
                    handleSuggestionClick({
                      id: item.id,
                      type: "town",
                    })
                  }
                >
                  <p className="font-semibold">{item.name}</p>
                  <p>{item.insee_code}</p>
                  <p>{item.postal_code}</p>
                  <p>{item.dep_code}</p>
                </li>
              ) : (
                <li
                  key={item.id}
                  className="grid grid-cols-3 gap-4 p-4 rounded bg-[#eeeeee]"
                  onClick={() =>
                    handleSuggestionClick({
                      id: item.id,
                      type: "character",
                    })
                  }
                >
                  <p className="font-semibold">
                    {item.firstname || ""} {item.lastname}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.towns?.name || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.towns?.dep_code || "-"}
                  </p>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Précédent
        </button>

        <span className="px-4 py-2">
          Page {page} sur {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
