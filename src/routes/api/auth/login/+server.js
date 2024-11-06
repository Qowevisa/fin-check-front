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
    const loginResponse = await login(username, password); // Call the backend login
    console.log("loginResponse = ", loginResponse)

    const session = loginResponse.headers.get("Set-Cookie");

    // Set cookie securely on the server
    cookies.set('session', loginResponse.token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'Strict', // Ensures the cookie is only sent in a first-party context
      maxAge: 3600 // Expiry time in seconds (e.g., 1 hour)
    });

    console.log("in POST5")
    return json({ id: loginResponse.id, name: loginResponse.name }); // Return necessary data
  } catch (error) {
    return json({ error: error.message }, { status: 401 });
  }
}

