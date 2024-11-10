import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url, fetch, cookies }) => {
  if (url.pathname == "/login") {
    return
  }
  const response = await fetch("https://api.fin.qowevisa.click/api/authping");

  if (!response.ok) {
    cookies.delete('session', { path: "/" })

    throw redirect(302, "/login");
  }
}
