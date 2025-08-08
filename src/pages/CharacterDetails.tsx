import { useParams } from "react-router";
import type { Character } from "../interfaces";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthProvider";

export default function CharacterDetails() {
  const [character, setCharacter] = useState<Character>();
  const [editableCharacter, setEditableCharacter] = useState<Character | null>(
    null
  );
  const [townName, setTownName] = useState<string | null>(null);
  const [editableTownName, setEditableTownName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams<"id">();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchCharacter = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("characters")
        .select("*, towns(name)")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setCharacter(data);
        setEditableCharacter(data);
        setTownName(data.towns?.name ?? null);
        setEditableTownName(data.towns?.name ?? null);
      }

      setLoading(false);
    };

    fetchCharacter();
  }, [id]);

  const handleFieldChange = (field: keyof Character, value: string) => {
    setEditableCharacter((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!editableCharacter || !character) return;

    setLoading(true);
    setErrorMsg(null);

    const updates = {
      lastname: editableCharacter.lastname,
      firstname: editableCharacter.firstname,
      bio: editableCharacter.bio,
      birthplace: editableCharacter.birthplace,
      deathplace: editableCharacter.deathplace,
      dep_code: editableCharacter.dep_code,
    };

    const { error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", character.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setCharacter(editableCharacter);
      setIsEditing(false);
    }

    setLoading(false);
  };

  if (loading) return <p>Loading…</p>;
  if (errorMsg) return <p className="text-red-600">{errorMsg}</p>;

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
              value={editableCharacter?.lastname || ""}
              onChange={(e) => handleFieldChange("lastname", e.target.value)}
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
              value={editableCharacter?.firstname || ""}
              onChange={(e) => handleFieldChange("firstname", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.firstname || "Aucune information"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">Lieu principal</label>
          {isEditing ? (
            <input
              type="text"
              value={editableTownName || ""}
              onChange={(e) => setEditableTownName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">{townName || "Aucune information"}</p>
          )}
        </div>

        {/* Département */}
        <div>
          <label className="text-sm text-gray-600">Département</label>
          {isEditing ? (
            <input
              type="text"
              value={editableCharacter?.dep_code || ""}
              onChange={(e) => handleFieldChange("dep_code", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.dep_code || "Aucune information"}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm text-gray-600">Bio</label>
          {isEditing ? (
            <textarea
              value={editableCharacter?.bio || ""}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              rows={4}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">
              {character?.bio || "Aucune information"}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Lieu de naissance ou de baptême
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editableCharacter?.birthplace || ""}
              onChange={(e) => handleFieldChange("birthplace", e.target.value)}
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
              value={editableCharacter?.deathplace || ""}
              onChange={(e) => handleFieldChange("deathplace", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800">
              {character?.deathplace || "Aucune information"}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="pt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Enregistrer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
