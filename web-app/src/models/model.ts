import { useQuery } from "@tanstack/react-query";

import { executeQuery } from "../db/duckdb";

// Models are implemented as custom hooks
// to cache the query results using React Query

function useExecuteQuery(queryKeys: string[], query: string) {
  return useQuery({
    queryKey: queryKeys,
    queryFn: async () => {
      const arrowTable = await executeQuery(query);
      // console.log("Rows: " + arrowTable?.numRows);
      return arrowTable;
    },
  });
}

export function usePlayers() {
  const query = `
    SELECT *
    FROM players
    ORDER BY name
  `;
  return useExecuteQuery(["players"], query);
}