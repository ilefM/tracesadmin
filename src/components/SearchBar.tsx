import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import type { ICharacterSuggestion, ITownSuggestion } from "../interfaces";
import { getCharactersSuggestions, getTownsSuggestions } from "../supabase/api";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [towns, setTowns] = useState<ITownSuggestion[]>([]);
  const [characters, setCharacters] = useState<ICharacterSuggestion[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchSuggestions(searchTerm);
        setIsSuggestionsVisible(true);
      } else {
        setTowns([]);
        setCharacters([]);
        setIsSuggestionsVisible(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    const charactersSuggestions = await getCharactersSuggestions(term);
    const townsSuggestions = await getTownsSuggestions(term);

    setTowns(townsSuggestions);
    setCharacters(charactersSuggestions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (item: {
    id: string;
    type: "town" | "character";
  }) => {
    if (item.type === "town") {
      navigate(`/commune-details/${item.id}`);
    } else {
      navigate(`/pionnier-details/${item.id}`);
    }
  };

  return (
    <div className="bg-[#ffffff] mx-auto p-4 w-full rounded-lg shadow-lg justify-center">
      <div className="flex h-5 w-full cursor-text items-center justify-between rounded-3xl px-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Rechercher un personnage ou une ville/village..."
          className="outline-none px-2 w-full"
        />
        <IoSearchOutline size="22px" className="ml-1" color="#b5b1b3" />
      </div>

      {isSuggestionsVisible && (characters.length > 0 || towns.length > 0) && (
        <>
          <div className="h-[1px] mx-2 mt-4 bg-[#e8e3e6]"></div>
          <div className="mt-2">
            {characters.length > 0 && (
              <>
                <div className="text-md font-semibold text-gray-500 px-2 mt-1">
                  Pionniers
                </div>
                <ul className="max-h-[400px] overflow-y-auto">
                  {characters.map((char) => (
                    <li
                      key={`char-${char.id}`}
                      onClick={() =>
                        handleSuggestionClick({
                          id: char.id,
                          type: "character",
                        })
                      }
                      className="rounded-lg text-neutral-700 p-2 my-1 hover:backdrop-brightness-95 hover:cursor-pointer"
                    >
                      {char.firstname} {char.lastname}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {towns.length > 0 && (
              <>
                <div className="text-md font-semibold text-gray-500 px-2 mt-2">
                  Communes
                </div>
                <ul className="max-h-[400px] overflow-y-auto">
                  {towns.map((town) => (
                    <li
                      key={`town-${town.id}`}
                      onClick={() =>
                        handleSuggestionClick({
                          id: town.id,
                          type: "town",
                        })
                      }
                      className="rounded-lg text-neutral-700 p-2 my-1 hover:backdrop-brightness-95 hover:cursor-pointer"
                    >
                      {town.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
