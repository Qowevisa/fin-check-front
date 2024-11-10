import type { ErrorMessage } from "$lib/api";
import { create, EntityTypes, type EntityType, type EntityName } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const POST: RequestHandler = async ({ request, cookies, params }): Promise<Response> => {
  const session = cookies.get('session')
  const { entity } = params;

  if (!session) {
    throw new Response(JSON.stringify("no cookies"), { status: 401 })
  }

  if (!(entity in EntityTypes)) {
    return new Response(JSON.stringify("Invalid entity"), { status: 400 });
  }

  const entityName = entity as EntityName;
  const data: EntityType<typeof entityName> = await request.json();

  const result = await create<EntityType<typeof entityName>>(entityName, data, session);
  if (isErrorMessage(result)) {
    return new Response(JSON.stringify(result), { status: 500 })
  }
  return new Response(JSON.stringify(result), { status: 200 })
}
