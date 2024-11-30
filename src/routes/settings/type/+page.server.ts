import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const typesPromise = fetch("/api/type/all").then((res) => res.json());
  const settingsPromise = fetch("/api/settings/type/all").then((res) => res.json());
  const [types, storedFilters] = await Promise.all([typesPromise, settingsPromise]);
  if (storedFilters) {
    return { types: types, storedFilters: storedFilters };
  } else {
    return { types: types, storedFilters: [] };
  }
};

