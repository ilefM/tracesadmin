import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Town } from "../interfaces";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthProvider";

export default function TownDetails() {
  const [town, setTown] = useState<Town | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Town>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { id } = useParams<"id">();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    const fetchTown = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("towns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setTown(data ?? null);
        setFormData(data ?? {});
      }
      setLoading(false);
    };
    fetchTown();
  }, [id]);

  const handleChange = (field: keyof Town, value: string) => {
    setFormError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (index: 0 | 1, value: number) => {
    setFormData((prev) => {
      const updated = [...(prev.position ?? [0, 0])] as [number, number];
      updated[index] = value;
      return { ...prev, position: updated };
    });
  };

  const handleUpdate = async () => {
    if (!id || !user) return;
    if (!formData.name || formData.name.trim() === "") {
      setFormError("Le nom de la commune ne peut pas être vide.");
      return;
    }

    setLoading(true);
    setFormError(null);

    const { error } = await supabase
      .from("towns")
      .update({
        name: formData.name,
        insee_code: formData.insee_code,
        dep_code: formData.dep_code,
        postal_code: formData.postal_code,
        position: formData.position,
        description: formData.description,
      })
      .eq("id", id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setTown({ ...town!, ...formData });
      setIsEditing(false);
    }

    setLoading(false);
  };

  if (loading) return <p className="text-center">Chargement…</p>;
  if (errorMsg) return <p className="text-red-600 text-center">Une </p>;

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
              value={formData.name || ""}
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
              type="number"
              value={formData.insee_code || ""}
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
              value={formData.postal_code || ""}
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
              value={formData.dep_code || ""}
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
                value={formData.position?.[0] ?? ""}
                onChange={(e) =>
                  handlePositionChange(0, parseFloat(e.target.value))
                }
                className="w-1/2 border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={formData.position?.[1] ?? ""}
                onChange={(e) =>
                  handlePositionChange(1, parseFloat(e.target.value))
                }
                className="w-1/2 border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ) : (
            <p className="text-gray-800 mt-1">
              {formData.position
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
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">
              {town?.description || "Aucune description"}
            </p>
          )}
        </div>

        {errorMsg && (
          <p className="text-red-600">
            Une erreur s'est produite. Veuillez rafraîchir la page ou réessayer.{" "}
            {errorMsg}
          </p>
        )}

        {isEditing && (
          <button
            onClick={handleUpdate}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Sauvegarder
          </button>
        )}
      </div>
    </div>
  );
}
