import type { ErrorMessage } from "$lib/api";
import { get_settings_for, type SettingsType, type SettingsName, SettingsTypes } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const GET: RequestHandler = async ({ cookies, params, url }): Promise<Response> => {
  const session = cookies.get('session');
  const { entity } = params;

  const queryParams = url.searchParams.toString();
  if (!session) {
    return new Response(JSON.stringify("no cookies"), { status: 401 });
  }

  if (!(entity in SettingsTypes)) {
    return new Response(JSON.stringify("Invalid entity"), { status: 400 });
  }

  const entityName = entity as SettingsName
  const result = await get_settings_for<SettingsType<typeof entityName>>(entityName, session, queryParams);

  if (isErrorMessage(result)) {
    return new Response(JSON.stringify(result), { status: 500 });
  }

  return new Response(JSON.stringify(result), { status: 200 });
}

