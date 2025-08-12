import type { ICharacterExcel, ITownExcel } from "../interfaces";
import { supabase } from "./supabaseClient";

export async function batchInsertTowns(towns: ITownExcel[]) {
  const { data: existingTowns, error: fetchError } = await supabase
    .from("towns")
    .select("insee_code");

  if (fetchError) {
    throw new Error();
  }

  const existingCodes = new Set(existingTowns.map((t) => t.insee_code));

  const newTowns = towns.filter(
    (t) => t.insee_code && !existingCodes.has(t.insee_code)
  );

  const skippedTowns = towns.filter(
    (t) => t.insee_code && existingCodes.has(t.insee_code)
  );

  if (newTowns.length === 0) {
    return {
      inserted: 0,
      skipped: towns.length,
      errors: ["Toutes les Villes/Communes existent déja!"],
    };
  }

  const chunkSize = 500;
  const errors: string[] = [];
  let insertedCount = 0;
  for (let i = 0; i < newTowns.length; i += chunkSize) {
    const chunk = newTowns.slice(i, i + chunkSize);
    const { error } = await supabase.from("towns").insert(chunk);
    if (error) {
      errors.push(error.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  return {
    inserted: insertedCount,
    skipped: skippedTowns,
    errors,
  };
}

export async function batchInsertCharacters(characters: ICharacterExcel[]) {
  const { data: towns, error: townsError } = await supabase
    .from("towns")
    .select("id, insee_code");

  if (townsError) throw new Error();

  const townMap = new Map(towns.map((t) => [t.insee_code, t.id]));

  const skippedCharacters: string[] = [];
  const validCharacters = characters
    .map((char) => {
      if (char.insee_code) {
        const townId = townMap.get(char.insee_code);
        if (!townId) {
          skippedCharacters.push(char.insee_code);
          return null;
        }
        return { ...char, town_id: townId };
      } else {
        return { ...char };
      }
    })
    .filter(Boolean) as (ICharacterExcel & { town_id: string })[];

  const errors: string[] = [];
  if (validCharacters.length === 0) {
    return { inserted: 0, skipped: characters.length };
  }

  const chunkSize = 500;
  let insertedCount = 0;

  for (let i = 0; i < validCharacters.length; i += chunkSize) {
    const chunk = validCharacters.slice(i, i + chunkSize);
    const { error } = await supabase.from("characters").insert(chunk);
    if (error) {
      errors.push(error.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  return {
    inserted: insertedCount,
    skipped: skippedCharacters,
    errors,
  };
}
