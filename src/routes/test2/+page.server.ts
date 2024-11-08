import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch("https://api.fin.qowevisa.click/api/authping");

  return {
    message: await response.json()
  };
}
