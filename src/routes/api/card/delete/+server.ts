import type { ErrorMessage } from "$lib/api";
import { remove, type Card } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const DELETE: RequestHandler = async ({ request, cookies }): Promise<Response> => {
  const session = cookies.get('session')
  if (!session) {
    throw new Response(JSON.stringify("no cookies"), { status: 401 })
  }
  const { id }: { id: number } = await request.json();
  const result = await remove<Card>("card", id, session);
  if (isErrorMessage(result)) {
    return new Response(JSON.stringify(result), { status: 500 })
  }
  return new Response(JSON.stringify(result), { status: 200 })
}
