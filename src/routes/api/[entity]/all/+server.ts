import type { ErrorMessage } from "$lib/api";
import { getAll, EntityTypes, type EntityType, type EntityName } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const GET: RequestHandler = async ({ cookies, params, url }): Promise<Response> => {
  const session = cookies.get('session');
  const { entity } = params;

  const queryParams = url.searchParams.toString();
  // Check if the entity is valid
  if (!session) {
    return new Response(JSON.stringify("no cookies"), { status: 401 });
  }

  if (!(entity in EntityTypes)) {
    return new Response(JSON.stringify("Invalid entity"), { status: 400 });
  }

  // TypeScript type inference for entity
  const entityName = entity as EntityName
  const result = await getAll<EntityType<typeof entityName>>(entityName, session, queryParams);

  if (isErrorMessage(result)) {
    console.log("ERROR");
    return new Response(JSON.stringify(result), { status: 500 });
  }

  return new Response(JSON.stringify(result), { status: 200 });
}
