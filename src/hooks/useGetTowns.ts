import { useEffect, useState } from "react";
import type { ITown } from "../interfaces";
import { supabase } from "../supabase/supabaseClient";

export default function useGetTowns(depFilter: string) {
  const [data, setData] = useState<ITown[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchError, setFetchError] = useState(null as string | null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const towns: ITown[] = [];
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("towns")
          .select("*")
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (depFilter) {
          query = query.ilike("dep_code", `%${depFilter}%`);
        }

        const { data, error } = await query;

        if (error) {
          setFetchError(error.message);
          break;
        }

        if (data && data.length > 0) {
          towns.push(...data);
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      setData(towns);
      setCurrentPage(1);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  return { data, fetchError, isLoading, currentPage };
}
