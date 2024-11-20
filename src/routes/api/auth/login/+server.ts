// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { login } from '$lib/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const authToken = request.headers.get('App-Token');
  if (authToken !== import.meta.env.VITE_AUTH_APP_TOKEN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  const { username, password } = await request.json();
  try {
    const loginResponse = await login(username, password, cookies);
    return json({ id: loginResponse.id, name: loginResponse.name });
  } catch (error) {
    return json({ error: error }, { status: 401 });
  }
}

