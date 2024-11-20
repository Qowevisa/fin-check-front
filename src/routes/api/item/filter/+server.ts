import type { ErrorMessage } from "$lib/api";
import { filter, type ItemFilter, type Item } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const POST: RequestHandler = async ({ request, cookies }): Promise<Response> => {
  const session = cookies.get('session')

  if (!session) {
    throw new Response(JSON.stringify("no cookies"), { status: 401 })
  }

  const data: ItemFilter = await request.json();
  const result = await filter<ItemFilter, Item>("item", data, session);
  if (isErrorMessage(result)) {
    return new Response(JSON.stringify(result), { status: 500 })
  }
  return new Response(JSON.stringify(result), { status: 200 })
}

