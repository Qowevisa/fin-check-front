// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { login } from '$lib/api';

export async function POST({ request, cookies }) {
  console.log("in POST1")
  const authToken = request.headers.get('App-Token');
  console.log("authToken = ", authToken)
  console.log("it should be = ", import.meta.env.VITE_AUTH_APP_TOKEN)
  if (authToken !== import.meta.env.VITE_AUTH_APP_TOKEN) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  console.log("in POST2")
  const { username, password } = await request.json();

  console.log("in POST3")
  try {
    console.log("in POST4")
    const loginResponse = await login(username, password, cookies);
    console.log("loginResponse = ", loginResponse)

    console.log("in POST5")
    return json({ id: loginResponse.id, name: loginResponse.name });
  } catch (error) {
    return json({ error: error.message }, { status: 401 });
  }
}

