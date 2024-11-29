import type { ErrorMessage } from "$lib/api";
import { get_stats_for, type StatsTypeCurrencyChart } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const GET: RequestHandler = async ({ cookies }): Promise<Response> => {
  const session = cookies.get('session');

  // const queryParams = url.searchParams.toString();
  // Check if the entity is valid
  if (!session) {
    return new Response(JSON.stringify("no cookies"), { status: 401 });
  }

  // TypeScript type inference for entity
  const result = await get_stats_for<StatsTypeCurrencyChart[]>("type", session);

  if (isErrorMessage(result)) {
    console.log("ERROR");
    return new Response(JSON.stringify(result), { status: 500 });
  }

  return new Response(JSON.stringify(result), { status: 200 });
}
