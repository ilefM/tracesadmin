import type {
  ICharacter,
  ICharacterExcel,
  ITown,
  ITownExcel,
} from "../interfaces";
import { supabase } from "./supabaseClient";

async function fetchAllInseeCodes() {
  let allCodes: string[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("towns")
      .select("insee_code")
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allCodes = allCodes.concat(data.map((row) => row.insee_code));
    from += batchSize;

    if (data.length < batchSize) break;
  }

  return allCodes;
}

async function fetchAllInseeCodesWithId() {
  let allIdAndInsee: { id: string; insee_code: string }[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("towns")
      .select("id, insee_code")
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allIdAndInsee = allIdAndInsee.concat(
      data.map((row) => ({ id: row.id, insee_code: row.insee_code }))
    );

    from += batchSize;

    if (data.length < batchSize) break;
  }

  return allIdAndInsee;
}

export async function batchInsertTowns(towns: ITownExcel[]) {
  const allInseeCodes = await fetchAllInseeCodes();

  const newTowns = towns.filter(
    (t) => t.insee_code && !allInseeCodes.includes(t.insee_code)
  );

  const skippedTowns = towns.filter(
    (t) => t.insee_code && allInseeCodes.includes(t.insee_code)
  );

  if (newTowns.length === 0) {
    return {
      insertedTowns: 0,
      skippedTowns: towns,
      errorsTowns: ["Toutes les Villes/Communes existent déja!"],
    };
  }

  const chunkSize = 500;
  const errorsTowns: string[] = [];
  let insertedCount = 0;
  for (let i = 0; i < newTowns.length; i += chunkSize) {
    const chunk = newTowns.slice(i, i + chunkSize);
    const { error } = await supabase.from("towns").insert(chunk);
    if (error) {
      errorsTowns.push(error.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  return {
    insertedTowns: insertedCount,
    skippedTowns: skippedTowns,
    errorsTowns,
  };
}

export async function batchInsertCharacters(characters: ICharacterExcel[]) {
  const existingIdINSEE = await fetchAllInseeCodesWithId();

  const townMap = new Map(existingIdINSEE.map((t) => [t.insee_code, t.id]));

  const skippedCharacters: ICharacterExcel[] = [];
  const validCharacters = characters
    .map((char) => {
      if (char.insee_code) {
        const townId = townMap.get(char.insee_code);
        if (!townId) {
          skippedCharacters.push(char);
          return null;
        }
        return { ...char, town_id: townId };
      } else {
        return { ...char };
      }
    })
    .filter(Boolean) as (ICharacterExcel & { town_id: string })[];

  const errorsCharacters: string[] = [];
  if (validCharacters.length === 0) {
    return {
      insertedCharactersNumber: 0,
      skippedCharacters,
      errorsCharacters: [
        "Aucun personnage valide à insérer. Assurez-vous que les codes INSEE sont corrects.",
      ],
    };
  }

  const validCharactersWithoutInseeProp = validCharacters.map(
    ({ insee_code, ...rest }) => rest
  );

  const chunkSize = 500;
  let insertedCount = 0;

  for (let i = 0; i < validCharactersWithoutInseeProp.length; i += chunkSize) {
    const chunk = validCharactersWithoutInseeProp.slice(i, i + chunkSize);
    const { error } = await supabase.from("characters").insert(chunk);
    if (error) {
      errorsCharacters.push(error.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  return {
    insertedCharactersNumber: insertedCount,
    skippedCharacters,
    errorsCharacters,
  };
}

export async function getTownFromId(id: string): Promise<ITown | null> {
  const { data, error } = await supabase
    .from("towns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw Error(
      "Erreur lors de la récupération de la commune: " + error.message
    );
  }

  return data as ITown;
}

export async function updateTown(newTown: ITown, id: string) {
  const { data: existingTownData, error: existingTownError } = await supabase
    .from("towns")
    .select("id, name, insee_code")
    .eq("insee_code", newTown.insee_code)
    .single();

  if (existingTownError) {
    throw Error(
      "Erreur lors de la vérification du code INSEE: " +
        existingTownError.message
    );
  }

  if (existingTownData && existingTownData.id !== id) {
    throw Error(
      "Le code INSEE existe déjà pour la commune " +
        existingTownData.name +
        " (" +
        existingTownData.insee_code +
        ")"
    );
  }

  const { error } = await supabase
    .from("towns")
    .update({
      name: newTown.name,
      insee_code: newTown.insee_code,
      dep_code: newTown.dep_code,
      postal_code: newTown.postal_code,
      position: newTown.position,
      description: newTown.description,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw Error(
      "Erreur lors de la mise à jour de la commune: " + error.message
    );
  }
}

export async function getCharacterFromId(
  id: string
): Promise<ICharacter | null> {
  const { data, error } = await supabase
    .from("characters")
    .select("*, towns(insee_code)")
    .eq("id", id)
    .single();

  if (error) {
    throw Error(
      "Erreur lors de la récupération du personnage: " + error.message
    );
  }

  return data as ICharacter;
}

export async function updateCharacter(
  newCharacter: ICharacter,
  id: string,
  newInsee: string | null
): Promise<void> {
  const { data: townData, error: townError } = await supabase
    .from("towns")
    .select("id, insee_code")
    .eq("insee_code", newInsee)
    .single();

  if (!townData) {
    throw Error("Le code INSEE fourni n'existe pas.");
  }

  if (townError) {
    throw Error("Erreur lors de la vérification du code INSEE");
  }

  const { error } = await supabase
    .from("characters")
    .update({
      lastname: newCharacter.lastname,
      firstname: newCharacter.firstname,
      bio: newCharacter.bio,
      birthplace: newCharacter.birthplace,
      deathplace: newCharacter.deathplace,
      town_id: townData.id,
      main_character: newCharacter.main_character,
    })
    .eq("id", id);

  if (error) {
    throw Error(
      "Erreur lors de la mise à jour du personnage: " + error.message
    );
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase.from("characters").delete().eq("id", id);

  if (error) {
    throw Error(
      "Erreur lors de la suppression du personnage: " + error.message
    );
  }
}

export async function deleteTown(id: string): Promise<void> {
  const { data: characters, error: charactersError } = await supabase
    .from("characters")
    .select("id")
    .eq("town_id", id);

  if (charactersError) {
    throw Error(
      "Erreur lors de la récupération des personnages associés: " +
        charactersError.message
    );
  }

  if (characters && characters.length > 0) {
    throw Error(
      "Impossible de supprimer la commune/ville car elle est associée à des personnages."
    );
  }
  const { error } = await supabase.from("towns").delete().eq("id", id);

  if (error) {
    throw Error(
      "Erreur lors de la suppression de la commune: " + error.message
    );
  }
}
