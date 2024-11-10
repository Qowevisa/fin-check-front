import type { ErrorMessage } from "$lib/api";
import { getAll, type Card } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const GET: RequestHandler = async ({ cookies }): Promise<Response> => {
  const session = cookies.get('session')
  if (!session) {
    throw new Response(JSON.stringify("no cookies"), { status: 401 })
  }

  const result = await getAll<Card>("card", session);
  if (isErrorMessage(result)) {
    console.log("ERROR")
    return new Response(JSON.stringify(result), { status: 500 })
  }
  return new Response(JSON.stringify(result), { status: 200 })
}
