import type { ICharacterExcel, ITownExcel } from "../interfaces";
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

  console.log(skippedCharacters);

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
