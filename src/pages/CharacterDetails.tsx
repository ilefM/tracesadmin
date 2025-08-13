import { useNavigate, useParams } from "react-router";
import type { ICharacter } from "../interfaces";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  deleteCharacter,
  getCharacterFromId,
  updateCharacter,
} from "../supabase/api";

export default function CharacterDetails() {
  const [character, setCharacter] = useState<ICharacter>();
  const [formData, setFormData] = useState<ICharacter>();
  const [insee, setInsee] = useState<string | null>(null);
  const [editableTownInsee, setEditableTownInsee] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorUpdate, setErrorUpdate] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState("");
  const [wantToDelete, setWantToDelete] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams<"id">();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchCharacter = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const characterFromId = await getCharacterFromId(id);
        if (!characterFromId) {
          setErrorMsg("Personnage non trouvé.");
          setLoading(false);
          return;
        }
        setCharacter(characterFromId);
        setFormData(characterFromId);
        setInsee(characterFromId.towns?.insee_code ?? null);
        setEditableTownInsee(characterFromId.towns?.insee_code ?? null);
      } catch (err) {
        setLoading(false);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Une erreur s'est produite lors du chargement du personnage."
        );
        return;
      }

      setLoading(false);
    };

    fetchCharacter();
  }, [id]);

  function handleChange(field: keyof ICharacter, value: string) {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleUpdate() {
    setErrorUpdate("");
    if (!formData || !character || !id || !user) return;

    if (!formData.lastname || formData.lastname.trim() === "") {
      setErrorUpdate("Le nom de famille ne peut pas être vide.");
      return;
    }

    setLoading(true);

    try {
      await updateCharacter(formData, character.id, editableTownInsee);
    } catch (err) {
      setErrorUpdate(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de la mise à jour du personnage."
      );
      setLoading(false);
      return;
    }

    setCharacter({ ...character!, ...formData });
    setIsEditing(false);
    setLoading(false);
    setIsSuccess("Personnage mis à jour avec succès.");
  }

  async function handleDeletion() {
    if (!id || !user) return;
    setLoading(true);

    try {
      await deleteCharacter(id);
    } catch (err) {
      setErrorUpdate(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de la suppression du personnage."
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setWantToDelete(false);
    navigate("/");
    setCharacter(undefined);
    setFormData(undefined);
  }

  if (loading) return <p className="text-lg">Chargement…</p>;
  if (errorMsg) return <p className="text-red-600 text-lg">{errorMsg}</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Détails du personnage</h1>
        {user && (
          <button
            className="text-sm text-blue-600 border border-blue-600 rounded px-3 py-1 hover:bg-blue-50"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Annuler" : "Éditer"}
          </button>
        )}
      </div>

      <div className="space-y-5 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <label className="text-sm text-gray-600">Nom de famille</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.lastname || ""}
              onChange={(e) => handleChange("lastname", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{character?.lastname}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Prénom</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.firstname || ""}
              onChange={(e) => handleChange("firstname", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.firstname || "Aucune information"}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <label className="text-sm text-gray-600 w-48">
            Est-il un personnage majeur ?
          </label>
          {isEditing ? (
            <input
              type="checkbox"
              checked={formData?.main_character || false}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, main_character: e.target.checked } : prev
                )
              }
              className="h-4 w-4 border border-gray-300 rounded"
            />
          ) : (
            <p className="text-gray-800">
              {character?.main_character ? "Oui" : "Non"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">
            INSEE du lieu principal
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editableTownInsee || ""}
              onChange={(e) => setEditableTownInsee(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{insee || "Aucune information"}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Lieu de naissance ou de baptême
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.birthplace || ""}
              onChange={(e) => handleChange("birthplace", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.birthplace || "Aucune information"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Lieu de décès ou d'inhumation
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.deathplace || ""}
              onChange={(e) => handleChange("deathplace", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.deathplace || "Aucune information"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Bio</label>
          {isEditing ? (
            <textarea
              value={formData?.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">
              {character?.bio || "Aucune information"}
            </p>
          )}
        </div>

        {errorUpdate && <p className="text-red-600">{errorUpdate}</p>}
        {isSuccess && <p className="text-green-600">{isSuccess}</p>}

        {isEditing && (
          <div>
            <p className="text-sm text-gray-500">
              Notez qu'en laissant le champ INSEE vide, le personnage ne sera
              plus associé à une commune.
            </p>
            <div className="mt-4 flex items-end justify-between">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                Sauvegarder
              </button>

              {wantToDelete ? (
                <div className="flex items-end space-x-4">
                  <button
                    onClick={handleDeletion}
                    className="bg-red-800 text-white text-sm px-2 h-8 rounded hover:bg-red-700"
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setWantToDelete(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setWantToDelete(true)}
                  className="bg-red-800 text-white text-sm px-2 h-8 rounded hover:bg-red-700"
                  disabled={loading}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
