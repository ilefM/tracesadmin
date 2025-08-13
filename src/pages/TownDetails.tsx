import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { ITown } from "../interfaces";
import { useAuth } from "../context/AuthProvider";
import { getTownFromId, updateTown } from "../supabase/api";

export default function TownDetails() {
  const [town, setTown] = useState<ITown>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ITown>>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [errorUpdate, setErrorUpdate] = useState<string>("");
  const [nameValidation, setNameValidation] = useState<string>("");
  const [inseeValidation, setInseeValidation] = useState<string>("");

  const { id } = useParams<"id">();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchTown = async () => {
      setLoading(true);

      try {
        const townFromId = await getTownFromId(id);
        if (!townFromId) {
          setErrorMsg("Commune non trouvée.");
          setLoading(false);
          return;
        }
        setTown(townFromId);
        setFormData(townFromId);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Une erreur s'est produite lors du chargement de la commune."
        );
      }
    };

    fetchTown();
  }, [id]);

  function handleChange(field: keyof ITown, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handlePositionChange(index: 0 | 1, value: number) {
    setFormData((prev) => {
      const updated = [...(prev?.position ?? [0, 0])] as [number, number];
      updated[index] = value;
      return { ...prev, position: updated };
    });
  }

  async function handleUpdate() {
    setNameValidation("");
    setInseeValidation("");
    if (!id || !user) return;
    if (!formData?.name || formData.name.trim() === "") {
      setNameValidation("Le nom de la commune ne peut pas être vide.");
      return;
    }

    if (!formData?.insee_code || formData.insee_code.trim() === "") {
      setInseeValidation("Le code INSEE ne peut pas être vide.");
      return;
    }

    setLoading(true);
    try {
      await updateTown(formData as ITown, id);
    } catch (err) {
      setLoading(false);
      setErrorUpdate(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de la mise à jour de la commune."
      );
      return;
    }

    setTown({ ...town!, ...formData });
    setIsEditing(false);

    setLoading(false);
  }

  if (loading) return <p className="text-center">Chargement…</p>;
  if (errorMsg) return <p className="text-red-600 text-center">{errorMsg}</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEditing ? "Modifier la commune" : town?.name}
        </h1>
        {user && (
          <button
            className="text-sm text-blue-600 border border-blue-600 rounded px-3 py-1 hover:bg-blue-50"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Annuler" : "Éditer"}
          </button>
        )}
      </div>

      <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <label className="text-sm text-gray-600">Nom</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{town?.name}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Code INSEE</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.insee_code || ""}
              onChange={(e) => handleChange("insee_code", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{town?.insee_code}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Code Postal</label>
          {isEditing ? (
            <input
              type="number"
              value={formData?.postal_code || ""}
              onChange={(e) => handleChange("postal_code", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{town?.postal_code}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Département</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.dep_code || ""}
              onChange={(e) => handleChange("dep_code", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{town?.dep_code}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Position (lat, long)</label>
          {isEditing ? (
            <div className="flex space-x-4 mt-1">
              <input
                type="number"
                placeholder="Latitude"
                value={formData?.position?.[0] ?? ""}
                onChange={(e) =>
                  handlePositionChange(0, parseFloat(e.target.value))
                }
                className="w-1/2 border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={formData?.position?.[1] ?? ""}
                onChange={(e) =>
                  handlePositionChange(1, parseFloat(e.target.value))
                }
                className="w-1/2 border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ) : (
            <p className="text-gray-800 mt-1">
              {formData?.position
                ? `${formData.position[0]}, ${formData.position[1]}`
                : "Aucune information"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          {isEditing ? (
            <textarea
              rows={4}
              value={formData?.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">
              {town?.description || "Aucune description"}
            </p>
          )}
        </div>

        {errorUpdate && <p className="text-red-600">{errorUpdate}</p>}

        {isEditing && (
          <div>
            {nameValidation && <p className="text-red-600">{nameValidation}</p>}
            {inseeValidation && (
              <p className="text-red-600">{inseeValidation}</p>
            )}

            <p className="text-sm text-gray-500">
              Assurez-vous que le code INSEE est unique pour cette commune.
            </p>
            <button
              onClick={handleUpdate}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              Sauvegarder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
