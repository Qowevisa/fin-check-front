import type { StatsTypeCurrencyChart } from "$lib/entities";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const expensesData: StatsTypeCurrencyChart[] = await fetch("/api/statistics/type").then((res) => res.json());
    return { expensesData: expensesData };
  } catch (error) {
    console.log("error in +page.server.ts", error)
    return { expensesData: [] };
  }
};

