import type { ErrorMessage } from "$lib/api";
import { SettingsTypes, type SettingsName, type SettingsType, update_settings_for } from "$lib/entities";
import type { RequestHandler } from "./$types";

function isErrorMessage(value: any): value is ErrorMessage {
  return value && typeof value.message === 'string';
}

export const PUT: RequestHandler = async ({ request, cookies, params }): Promise<Response> => {
  const session = cookies.get('session')
  const { entity } = params;

  if (!session) {
    throw new Response(JSON.stringify("no cookies"), { status: 401 })
  }

  if (!(entity in SettingsTypes)) {
    return new Response(JSON.stringify("Invalid entity"), { status: 400 });
  }

  const entityName = entity as SettingsName;
  const data: SettingsType<typeof entityName> = await request.json();
  const result = await update_settings_for<SettingsType<typeof entityName>>(entityName, data, session);
  if (isErrorMessage(result)) {
    return new Response(JSON.stringify(result), { status: 500 })
  }
  return new Response(JSON.stringify(result), { status: 200 })
}
